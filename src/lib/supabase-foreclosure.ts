import { createClient, SupabaseClient } from '@supabase/supabase-js'

const foreclosureUrl = process.env.FORECLOSURE_DB_URL || ''
const foreclosureServiceKey = process.env.FORECLOSURE_DB_SERVICE_KEY || ''

let _foreclosureClient: SupabaseClient | null = null

export function getForeclosureClient(): SupabaseClient {
  if (!_foreclosureClient) {
    if (!foreclosureUrl || !foreclosureServiceKey) {
      throw new Error('Foreclosure DB URL and service key must be configured')
    }
    _foreclosureClient = createClient(foreclosureUrl, foreclosureServiceKey)
  }
  return _foreclosureClient
}
