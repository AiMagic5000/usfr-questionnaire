import { NextRequest, NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const county = searchParams.get('county')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (!state) {
      return NextResponse.json(
        { error: 'State parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createAgentsServerClient()

    let query = supabase
      .from('notaries')
      .select('*')
      .eq('state_abbr', state.toUpperCase())
      .order('rating', { ascending: false, nullsFirst: false })
      .order('review_count', { ascending: false })
      .range(offset, offset + limit - 1)

    if (county) {
      query = query.ilike('county_name', `%${county}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Notary query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notaries' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      notaries: data || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (err) {
    console.error('Notary API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
