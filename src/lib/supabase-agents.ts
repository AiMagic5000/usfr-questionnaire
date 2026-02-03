import { createClient, SupabaseClient } from '@supabase/supabase-js'

const agentsUrl = process.env.NEXT_PUBLIC_USFR_AGENTS_URL || ''
const agentsAnonKey = process.env.NEXT_PUBLIC_USFR_AGENTS_ANON_KEY || ''

// Lazy-initialized client to avoid build-time crashes when env vars missing
let _anonClient: SupabaseClient | null = null

export function getAgentsClient(): SupabaseClient {
  if (!_anonClient) {
    if (!agentsUrl || !agentsAnonKey) {
      throw new Error('USFR agents Supabase URL and anon key must be configured')
    }
    _anonClient = createClient(agentsUrl, agentsAnonKey)
  }
  return _anonClient
}

export function createAgentsServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_USFR_AGENTS_URL || ''
  const serviceKey = process.env.USFR_AGENTS_SERVICE_KEY || ''
  if (!url || !serviceKey) {
    throw new Error('USFR agents Supabase URL and service key must be configured')
  }
  return createClient(url, serviceKey)
}
