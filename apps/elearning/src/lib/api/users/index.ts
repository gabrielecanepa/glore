import { type DatabaseClient } from '@/lib/api/types'
import { DatabaseError } from '@/lib/db/utils'
import { getEncodedCookie } from '@/lib/storage/server'

import { parseUser } from './parser'
import { userQuery } from './queries'

export const getCurrentUser = async () => {
  const user = await getEncodedCookie('user')
  if (!user) throw new DatabaseError('NO_RESULTS', 'User not found')

  return user
}

export const findUser = async (db: DatabaseClient, id: string) => {
  const { data, error } = await db.from('users').select(userQuery).eq('id', id).single()
  if (error) throw error
  if (!data) throw new DatabaseError('NO_RESULTS', 'User not found')

  return parseUser(data)
}

export const findUserByUsername = async (db: DatabaseClient, username: string) => {
  const { data, error } = await db
    .from('users')
    .select(userQuery)
    .or(`email.eq.${username},username.eq.${username}`)
    .single()

  if (error) throw error
  if (!data) throw new DatabaseError('NO_RESULTS', 'User not found')

  return parseUser(data)
}

export default {
  getCurrent: getCurrentUser,
  find: findUser,
  findByUsername: findUserByUsername,
}

export * from './types'
