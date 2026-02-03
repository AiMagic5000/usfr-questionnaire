import { NextRequest, NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json()

    if (!pin || typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { valid: false, error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      )
    }

    const supabase = createAgentsServerClient()

    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, name, pin_hash, status')
      .eq('status', 'active')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { valid: false, error: 'Service unavailable' },
        { status: 503 }
      )
    }

    if (!agents || agents.length === 0) {
      return NextResponse.json({ valid: false, error: 'Invalid PIN' })
    }

    let matchedAgent = null
    for (const agent of agents) {
      const isMatch = await bcrypt.compare(pin, agent.pin_hash)
      if (isMatch) {
        matchedAgent = agent
        break
      }
    }

    if (!matchedAgent) {
      return NextResponse.json({ valid: false, error: 'Invalid PIN' })
    }

    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    await supabase.from('agent_sessions').insert({
      agent_id: matchedAgent.id,
      session_token: sessionToken,
      expires_at: expiresAt,
    })

    return NextResponse.json({
      valid: true,
      agentName: matchedAgent.name,
      agentId: matchedAgent.id,
      sessionToken,
    })
  } catch (err) {
    console.error('PIN validation error:', err)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
