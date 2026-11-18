import { createClient, type SupabaseClientOptions } from '@supabase/supabase-js'

// crypto-db (VPS, vps-ops services/crypto-db) holds the crypto tables off the
// free-plan Supabase box: historic_prices (2026-11-17), daily_token_supplies,
// daily_validator_history, league_*, *_holders and cron_progress (2026-11-18).
// This key can only SELECT public data — the same exposure as a Supabase anon
// key — so it lives here, not in the Vercel env.
const CRYPTO_DB_URL = 'https://crypto-db.hexgeta.com'

export const cryptoDb = createClient(
  CRYPTO_DB_URL,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjcnlwdG8tZGIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc5NDkxODgxMSwiZXhwIjoyMTEwMjc4ODExfQ.NS6whGpy79m9xjEQZnyj5MVAyKvSbz_tH8IfX6nCccU',
  { auth: { persistSession: false, autoRefreshToken: false } }
)

/** Read-write (service role); CRYPTO_DB_SERVICE_KEY is in the Vercel env. */
export function cryptoDbWriter(options: SupabaseClientOptions<'public'> = {}) {
  return createClient(CRYPTO_DB_URL, process.env.CRYPTO_DB_SERVICE_KEY!, {
    ...options,
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
