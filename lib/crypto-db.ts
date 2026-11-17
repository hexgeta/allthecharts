import { createClient } from '@supabase/supabase-js'

// crypto-db (VPS, vps-ops services/crypto-db) holds historic_prices since
// 2026-11-17, off the free-plan Supabase box. Its writer is lookintomaxi's
// daily job on the VPS. This key can only SELECT public data — the same
// exposure as a Supabase anon key — so it lives here, not in the Vercel env.
export const cryptoDb = createClient(
  'https://crypto-db.hexgeta.com',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjcnlwdG8tZGIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc5NDkxODgxMSwiZXhwIjoyMTEwMjc4ODExfQ.NS6whGpy79m9xjEQZnyj5MVAyKvSbz_tH8IfX6nCccU',
  { auth: { persistSession: false, autoRefreshToken: false } }
)
