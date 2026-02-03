import { NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'

export async function GET() {
  try {
    const supabase = createAgentsServerClient()

    const { data, error } = await supabase
      .from('notaries')
      .select('state_abbr, county_name')

    if (error) {
      console.error('States query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch states' },
        { status: 500 }
      )
    }

    const stateMap: Record<string, Set<string>> = {}
    for (const row of data || []) {
      if (!stateMap[row.state_abbr]) {
        stateMap[row.state_abbr] = new Set()
      }
      stateMap[row.state_abbr].add(row.county_name)
    }

    const states = Object.entries(stateMap)
      .map(([state, counties]) => ({
        state,
        countyCount: counties.size,
        counties: Array.from(counties).sort(),
      }))
      .sort((a, b) => a.state.localeCompare(b.state))

    return NextResponse.json({ states })
  } catch (err) {
    console.error('States API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
