import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { TrialGroup } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface WinnerPrediction {
  groupId: string
  groupName: string
  predictedWinnerVersionNumber: number
  confidence: 'low' | 'medium' | 'high'
  reasoning: string
}

export interface PredictWinnerResponse {
  predictions: WinnerPrediction[]
}

export async function POST(request: NextRequest) {
  const { liveGroups, historicalGroups }: { liveGroups: TrialGroup[]; historicalGroups: TrialGroup[] } =
    await request.json()

  if (liveGroups.length === 0) {
    return Response.json({ predictions: [] })
  }

  const historicalContext = historicalGroups.map((g) => ({
    name: g.name,
    testType: g.testType,
    winner: g.versions.find((v) => v.isWinner),
    versions: g.versions.map((v) => ({
      versionNumber: v.versionNumber,
      isWinner: v.isWinner,
      snapshots: v.snapshots,
    })),
  }))

  const liveContext = liveGroups.map((g) => ({
    id: g.id,
    name: g.name,
    testType: g.testType,
    versions: g.versions.map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      snapshot24h: v.snapshots.find((s) => s.takenAt === '24h'),
    })),
  }))

  const prompt = `You are an expert social media analyst for Hobbycraft, a UK craft retailer.

You have historical A/B test data showing which 24-hour metrics predicted long-term performance (3-day and 7-day results). Use these patterns to predict which version is most likely to win for each live trial.

HISTORICAL DATA (trials where we know the outcome):
${JSON.stringify(historicalContext, null, 2)}

LIVE TRIALS TO PREDICT (only 24h data available so far):
${JSON.stringify(liveContext, null, 2)}

For each live trial, predict the winner. Focus on which 24h signals (especially completion rate, saves, and watch time) have historically correlated with long-term performance in this dataset.

Return ONLY a valid JSON object, no markdown, no preamble:
{
  "predictions": [
    {
      "groupId": "<the group id>",
      "groupName": "<the group name>",
      "predictedWinnerVersionNumber": <number>,
      "confidence": "low" | "medium" | "high",
      "reasoning": "<one concise sentence explaining why, referencing the key 24h signal>"
    }
  ]
}`

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return new Response('Failed to parse AI response', { status: 500 })
  }

  const result: PredictWinnerResponse = JSON.parse(jsonMatch[0])
  return Response.json(result)
}
