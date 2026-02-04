import { NextRequest, NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'

/**
 * Helper function to detect if a search term is a phone number
 * Returns true if string contains only digits and is 3-10 characters
 */
function looksLikePhone(search: string): boolean {
  const digitsOnly = search.replace(/\D/g, '')
  return digitsOnly.length >= 3 && digitsOnly.length <= 10 && digitsOnly === search
}

/**
 * Helper function to detect if a search term is a zip code
 * Returns true if string is exactly 5 digits
 */
function looksLikeZip(search: string): boolean {
  return /^\d{5}$/.test(search)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const county = searchParams.get('county')
    const search = searchParams.get('search')
    const limitParam = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Clamp limit between 1 and 50
    const limit = Math.min(Math.max(limitParam, 1), 50)

    // State is optional now - only required if no search is provided
    if (!state && !search) {
      return NextResponse.json(
        { error: 'Either state or search parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createAgentsServerClient()

    // Start building query with count
    let query = supabase
      .from('notaries')
      .select('*', { count: 'exact' })

    // Filter by state if provided
    if (state) {
      query = query.eq('state_abbr', state.toUpperCase())
    }

    // Filter by county if provided
    if (county) {
      query = query.ilike('county_name', `%${county}%`)
    }

    // Apply search filters based on search term format
    if (search) {
      const trimmedSearch = search.trim()

      if (looksLikePhone(trimmedSearch)) {
        // Search phone_normalized for phone-like searches
        query = query.ilike('phone_normalized', `%${trimmedSearch}%`)
      } else if (looksLikeZip(trimmedSearch)) {
        // Exact match on zip_code for 5-digit searches
        query = query.eq('zip_code', trimmedSearch)
      } else {
        // Full-text search across business_name and city
        // Use OR filter for multiple fields
        query = query.or(`business_name.ilike.%${trimmedSearch}%,city.ilike.%${trimmedSearch}%`)
      }
    }

    // Apply ordering and pagination
    query = query
      .order('rating', { ascending: false, nullsFirst: false })
      .order('review_count', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Notary query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notaries', details: error.message },
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
