import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { TrialGroup, AIInsights } from '@/lib/types'
import crypto from 'crypto'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 h'),
})

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return new Response('Too many requests', { status: 429 })
  }

  const { trialData, forceRefresh }: { trialData: TrialGroup[]; forceRefresh?: boolean } =
    await request.json()

  const dataHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(trialData))
    .digest('hex')

  const supabase = createServerSupabaseClient()

  if (!forceRefresh) {
    const { data: cached } = await supabase
      .from('ai_insights_cache')
      .select('*')
      .eq('id', 1)
      .single()

    if (cached && cached.data_hash === dataHash) {
      const ageMs = new Date().getTime() - new Date(cached.refreshed_at).getTime()
      if (ageMs < 24 * 60 * 60 * 1000) {
        return Response.json({ ...cached.insights, refreshedAt: cached.refreshed_at, fromCache: true })
      }
    }
  }

  const prompt = `You are a social media analytics expert for Hobbycraft, a UK craft retailer.
Analyse the following Trial Reel A/B test data and return ONLY a JSON object with no markdown, no preamble.

Return exactly this shape:
{
  "shortTermInsights": ["string", "string", "string"],
  "longTermInsights": ["string", "string", "string"],
  "contentSuggestions": ["string", "string", "string"],
  "watchOut": ["string", "string"]
}

TRIAL DATA:
${JSON.stringify(trialData)}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return new Response('Failed to parse AI response', { status: 500 })
  }

  const insights: AIInsights = JSON.parse(jsonMatch[0])
  const now = new Date().toISOString()

  await supabase.from('ai_insights_cache').upsert({
    id: 1,
    insights,
    data_hash: dataHash,
    refreshed_at: now,
  })

  return Response.json({ ...insights, refreshedAt: now, fromCache: false })
}
