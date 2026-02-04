import { NextRequest, NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'
import { getForeclosureClient } from '@/lib/supabase-foreclosure'

export async function POST(request: NextRequest) {
  try {
    // Validate agent session
    const sessionToken = request.headers.get('x-agent-session')
    if (!sessionToken) {
      return NextResponse.json(
        { connected: false, error: 'Agent session required' },
        { status: 401 }
      )
    }

    const agentsDb = createAgentsServerClient()

    // Get agent session + agent email
    const { data: session } = await agentsDb
      .from('agent_sessions')
      .select('id, agent_id, expires_at')
      .eq('session_token', sessionToken)
      .single()

    if (!session || new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { connected: false, error: 'Invalid or expired agent session' },
        { status: 401 }
      )
    }

    // Get agent email from agents table
    const { data: agent } = await agentsDb
      .from('agents')
      .select('id, email')
      .eq('id', session.agent_id)
      .single()

    if (!agent?.email) {
      return NextResponse.json(
        { connected: false, error: 'Agent account has no email configured' },
        { status: 404 }
      )
    }

    const agentEmail = agent.email.trim().toLowerCase()

    // Look up matching access in foreclosure DB using service role key
    const foreclosureDb = getForeclosureClient()
    const { data: pinRows, error: dbError } = await foreclosureDb
      .from('user_pins')
      .select('id, states_access, is_active, expires_at')
      .eq('email', agentEmail)
      .eq('is_active', true)

    if (dbError) {
      return NextResponse.json(
        { connected: false, error: 'Service unavailable' },
        { status: 503 }
      )
    }

    // Find a valid (non-expired) access record
    const validAccess = pinRows?.find((row) => {
      if (row.expires_at && new Date(row.expires_at) < new Date()) return false
      return true
    })

    if (!validAccess) {
      return NextResponse.json({
        connected: false,
        error: 'No active leads access found for your account. Contact your administrator.',
      })
    }

    // Update last_used_at
    await foreclosureDb
      .from('user_pins')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', validAccess.id)

    return NextResponse.json({
      connected: true,
      statesAccess: validAccess.states_access || [],
    })
  } catch (err) {
    console.error('Leads connect error:', err)
    return NextResponse.json(
      { connected: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
