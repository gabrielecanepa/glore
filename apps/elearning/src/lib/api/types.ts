import type { AnyArray, SnakeToCamel } from '@repo/utils/types'

import { createDatabase } from '@/lib/db/server'
import { type TableName } from '@/lib/db/types'
import { type IntlRecord } from '@/lib/i18n/types'
import { type Tables } from 'supabase/types'

import { type createApi } from './server'

/**
 * Internal API client.
 */
export type Api = ReturnType<typeof createApi>

/**
 * Entity from the database with keys tranformed to camel case
 * and optional foreign keys and timestamps.
 */
export type Entity<
  T extends TableName,
  L extends Exclude<keyof Tables<T>, ForeignKey<T> | Timestamp> = never,
  U extends ForeignKey<T> | Timestamp = never,
> = {
  [K in keyof Omit<
    Tables<T>,
    Exclude<ForeignKey<T> | Timestamp | 'deleted_at', U>
  > as SnakeToCamel<K>]: Tables<T>[K] extends AnyArray
    ? Entity<Tables<T>[K][number], L, U>[]
    : K extends L
      ? IntlRecord
      : Tables<T>[K]
}

/**
 * Table foreign key.
 */
export type ForeignKey<T extends TableName> = {
  [K in keyof Tables<T>]: K extends `${string}_id` ? K : never
}[keyof Tables<T>]

/**
 * Database timestamps.
 */
export type Timestamp = 'created_at' | 'updated_at'

/**
 * Database client.
 */
export type DatabaseClient = Awaited<ReturnType<typeof createDatabase>>

/**
 * Data returned from a database select query.
 */
export type SelectData<T extends TableName, Q extends string> = NonNullable<
  Awaited<ReturnType<ReturnType<typeof _singleSelect<T, Q>>>>['data']
>

const _singleSelect =
  <T extends TableName, Q extends string>(table: T, query: Q) =>
  async () =>
    await (await createDatabase()).from(table).select(query).single()
