import { env } from '@repo/utils/env'
import { isServer } from '@repo/utils/is-server'

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!
const OPENAI_MODEL = env('OPENAI_MODEL', 'gpt-4o')

if (!STORAGE_URL || !SUPABASE_ANON_KEY || !SUPABASE_URL || (isServer() && !OPENAI_API_KEY))
  throw new Error('Missing required environment variables')

const NODE_ENV = env('NODE_ENV', 'development')
const DEV = NODE_ENV === 'development'
const PROD = NODE_ENV === 'production'
const ANALYZE = env('ANALYZE', 'false') === 'true' || env('ANALYZE', 'false') === '1'

/**
 * Application environment.
 */
export const Env = Object.freeze({
  NODE_ENV,
  DEV,
  PROD,
  ANALYZE,
  STORAGE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  OPENAI_API_KEY,
  OPENAI_MODEL,
})
