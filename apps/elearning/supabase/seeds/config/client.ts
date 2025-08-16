import 'dotenv/config'

import { createClient } from '@supabase/supabase-js'
import { Client } from 'pg'

import { type Database } from 'supabase/types'

const supaEnv = (key: string) => process.env[`SUPABASE_${key}`] || process.env[`NEXT_PUBLIC_SUPABASE_${key}`]

export const URL = supaEnv('URL')
export const DB_URL = process.env.SUPABASE_DB_URL
export const SERVICE_ROLE_KEY = supaEnv('SERVICE_ROLE_KEY')
export const STORAGE_URL = supaEnv('STORAGE_URL')

if (!URL || !DB_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

export const client = createClient<Database>(URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const pg = new Client({ connectionString: DB_URL })
await pg.connect()
export { pg }
