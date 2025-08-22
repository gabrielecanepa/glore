import { type PostgrestSingleResponse, type UserResponse } from '@supabase/supabase-js'

import { log } from '@repo/utils/logger'
import { pluralize } from '@repo/utils/pluralize'
import { pickRandom, randomRange } from '@repo/utils/random'

import { type Database, type Enums } from 'supabase/types'

import { pg } from './client'
import { locales, user } from './data'

type PublicTable = keyof Database['public']['Tables']

export const resetDatabase = async () => {
  const publicTables = (
    await pg.query<{
      table_name: string
    }>("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
  ).rows.map(table => `public.${table.table_name}`)

  await pg.query('TRUNCATE auth.users CASCADE')
  await pg.query(`TRUNCATE ${publicTables.join(', ')} RESTART IDENTITY CASCADE`)
}

export const emailToRole = (email?: string) => email?.split('@')[0]

export const randomUserDetails = () => {
  const sex = pickRandom(user.sex) as Enums<'sex'>
  const gender = ['male', 'female'].includes(sex) ? (sex as 'male' | 'female') : undefined
  const pronouns =
    sex === 'male'
      ? 'he/him'
      : sex === 'female'
        ? 'she/her'
        : sex === 'non-binary'
          ? pickRandom(user.pronouns)
          : undefined

  return { sex, pronouns, gender }
}

export const logEntities = <T>(entities: Partial<Record<PublicTable, T[]>>) => {
  const entity = Object.keys(entities)[0] as PublicTable
  const list = entities[entity]!
  if (list.length === 0) return log.error(`No ${entity} created`)
  log.success(`Created ${list.length} ${pluralize(entity, list.length)}`)
}

export const randomLanguages = () => randomRange(locales, 0, 3) as Enums<'language'>[]

export const pickLanguages = (record: Record<Enums<'language'>, string>, locales: Enums<'language'>[]) => {
  const obj = Object.entries(record).reduce(
    (obj, [locale, value]) => (locales.includes(locale as Enums<'language'>) ? { ...obj, [locale]: value } : obj),
    {},
  )
  return Object.keys(obj).length ? (obj as Record<Enums<'language'>, string>) : record
}

export const createIncludes = (args: string[]) => (arg: string) =>
  args.filter(arg => !arg.startsWith('--')).length === 0 || args.includes(arg) || args.includes(`${arg}s`)

export const verifyResponse = <T>(response: PostgrestSingleResponse<T> | UserResponse, table?: PublicTable) => {
  const hasData = Array.isArray(response.data) ? response.data.length > 0 : !!response.data
  if (hasData && !response.error) return
  if (response.error) throw response.error
  throw new Error(`Can't create ${table}`)
}
