import { type DatabaseClient } from '@/lib/api/types'
import { findUser } from '@/lib/api/users'
import { type User } from '@/lib/api/users/types'
import { DatabaseError } from '@/lib/db/utils'
import { cookies } from '@/lib/storage'

export const login = async (
  db: DatabaseClient,
  {
    email,
    password,
  }: Pick<User, 'email'> & {
    password: string
  },
) => {
  const { data, error } = await db.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (!data?.user) throw new DatabaseError('INVALID_CREDENTIALS')

  const user = await findUser(db, data.user.id)
  if (!user) throw new DatabaseError('NO_RESULTS', 'User not found')

  cookies.setEncoded('user', user)

  return user
}

export const logout = async (db: DatabaseClient) => {
  const { error } = await db.auth.signOut()
  if (error) throw error

  cookies.delete('user')

  return true
}

export default {
  login,
  logout,
}

export * from './types'
