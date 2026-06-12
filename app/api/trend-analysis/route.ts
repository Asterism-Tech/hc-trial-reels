import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { TrialGroup } from '@/lib/types'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 h'),
})

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface TrendAnalysis {
  summary: string
  trends: string[]
  recommendations: string[]
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return new Response('Too many requests', { status: 429 })
  }

  const { trialData, startDate, endDate }: { trialData: TrialGroup[]; startDate: string; endDate: string } =
    await request.json()

  if (!Array.isArray(trialData) || trialData.length === 0) {
    return Response.json({
      summary: 'No reels in the selected period.',
      trends: [],
      recommendations: [],
    })
  }

  const prompt = `You are a social media analytics expert for Hobbycraft, a UK craft retailer.
Analyse the following Trial Reel A/B test data for the reporting period ${startDate} to ${endDate}.
This analysis will be included in an exported design report, so write in a clear, professional tone.

Return ONLY a JSON object with no markdown, no preamble, exactly this shape:
{
  "summary": "one paragraph executive summary of performance trends in this period",
  "trends": ["string", "string", "string"],
  "recommendations": ["string", "string", "string"]
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

  const analysis: TrendAnalysis = JSON.parse(jsonMatch[0])
  return Response.json(analysis)
}
