import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { TrialGroup } from '@/lib/types'

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

  const { messages, trialData }: { messages: { role: string; content: string }[]; trialData: TrialGroup[] } =
    await request.json()

  const systemPrompt = `You are a social media analytics assistant for Hobbycraft, a UK craft retailer.
You have access to their Trial Reel A/B test data. Answer questions concisely and
always reference specific trials by name where relevant. Be direct and actionable.

TRIAL DATA:
${JSON.stringify(trialData)}`

  const anthropicMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const supabase = createServerSupabaseClient()

  const lastUserMessage = messages[messages.length - 1]
  if (lastUserMessage?.role === 'user') {
    await supabase.from('chat_history').insert({
      role: 'user',
      content: lastUserMessage.content,
    })
  }

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: anthropicMessages,
  })

  let fullResponse = ''

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const text = event.delta.text
          fullResponse += text
          controller.enqueue(encoder.encode(text))
        }
      }
      controller.close()

      await supabase.from('chat_history').insert({
        role: 'assistant',
        content: fullResponse,
      })
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
