import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { seedDatabase } from '@/lib/seed'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
    return new Response('Unauthorised', { status: 401 })
  }

  try {
    const supabase = createServerSupabaseClient()
    const result = await seedDatabase(supabase)
    return Response.json(result)
  } catch (error) {
    console.error('Seed error:', error)
    return new Response('Seed failed', { status: 500 })
  }
}
