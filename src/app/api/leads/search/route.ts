import { NextRequest, NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'
import { getForeclosureClient } from '@/lib/supabase-foreclosure'

const LEADS_PER_PAGE = 10

const LEAD_SELECT_FIELDS = [
  'id',
  'owner_name',
  'property_address',
  'city',
  'state_abbr',
  'zip_code',
  'parcel_id',
  'foreclosure_type',
  'sale_date',
  'sale_amount',
  'mortgage_amount',
  'lender_name',
  'primary_phone',
  'primary_email',
  'mailing_address',
  'estimated_market_value',
  'case_number',
].join(',')

export async function POST(request: NextRequest) {
  try {
    const { search, state, page = 1, limit = LEADS_PER_PAGE } = await request.json()

    // Validate agent session
    const sessionToken = request.headers.get('x-agent-session')
    if (!sessionToken) {
      return NextResponse.json(
        { leads: [], error: 'Agent session required' },
        { status: 401 }
      )
    }

    const agentsDb = createAgentsServerClient()
    const { data: session } = await agentsDb
      .from('agent_sessions')
      .select('id, agent_id, expires_at')
      .eq('session_token', sessionToken)
      .single()

    if (!session || new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { leads: [], error: 'Invalid or expired agent session' },
        { status: 401 }
      )
    }

    // Get agent email
    const { data: agent } = await agentsDb
      .from('agents')
      .select('id, email')
      .eq('id', session.agent_id)
      .single()

    if (!agent?.email) {
      return NextResponse.json(
        { leads: [], error: 'Agent account has no email configured' },
        { status: 401 }
      )
    }

    const agentEmail = agent.email.trim().toLowerCase()

    // Look up states_access from foreclosure DB using service role key
    const foreclosureDb = getForeclosureClient()
    const { data: pinRows, error: pinError } = await foreclosureDb
      .from('user_pins')
      .select('id, states_access, is_active, expires_at')
      .eq('email', agentEmail)
      .eq('is_active', true)

    if (pinError || !pinRows || pinRows.length === 0) {
      return NextResponse.json(
        { leads: [], error: 'No leads access found for your account' },
        { status: 401 }
      )
    }

    const validAccess = pinRows.find((row) => {
      if (row.expires_at && new Date(row.expires_at) < new Date()) return false
      return true
    })

    if (!validAccess) {
      return NextResponse.json(
        { leads: [], error: 'Your leads access has expired' },
        { status: 401 }
      )
    }

    const statesAccess: string[] = validAccess.states_access || []
    if (statesAccess.length === 0) {
      return NextResponse.json({
        leads: [],
        meta: { total: 0, page: 1, totalPages: 0 },
      })
    }

    // Build query
    const pageNum = Math.max(1, Number(page))
    const pageSize = Math.min(50, Math.max(1, Number(limit)))
    const offset = (pageNum - 1) * pageSize

    let query = foreclosureDb
      .from('foreclosure_leads')
      .select(LEAD_SELECT_FIELDS, { count: 'exact' })

    // Filter by states access (unless ALL)
    if (!statesAccess.includes('ALL')) {
      query = query.in('state_abbr', statesAccess)
    }

    // Filter by specific state if provided
    if (state && state.length === 2) {
      query = query.eq('state_abbr', state.toUpperCase())
    }

    // Search by owner name, property address, or city
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`
      query = query.or(
        `owner_name.ilike.${searchTerm},property_address.ilike.${searchTerm},city.ilike.${searchTerm}`
      )
    }

    query = query
      .order('sale_date', { ascending: false, nullsFirst: false })
      .range(offset, offset + pageSize - 1)

    const { data: leads, error: leadsError, count } = await query

    if (leadsError) {
      console.error('Leads search error:', leadsError)
      return NextResponse.json(
        { leads: [], error: 'Failed to search leads' },
        { status: 500 }
      )
    }

    const total = count ?? 0

    return NextResponse.json({
      leads: leads || [],
      statesAccess,
      meta: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (err) {
    console.error('Leads search error:', err)
    return NextResponse.json(
      { leads: [], error: 'Internal server error' },
      { status: 500 }
    )
  }
}
