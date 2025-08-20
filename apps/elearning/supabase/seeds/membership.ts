import { type User } from '@supabase/supabase-js'

import { type Enums, type Tables } from 'supabase/types'

import { client } from './config/client'
import { organization as seeder } from './config/data'
import { emailToRole, verifyResponse } from './config/utils'

export const seedMemberships = async (organization: Tables<'organizations'>, users: User[]) => {
  const response = await client
    .from('memberships')
    .insert(
      seeder.memberships.map(role => {
        const user = users.find(user => emailToRole(user.email) === role)!

        return {
          role: role as Enums<'role'>,
          organization_id: organization.id,
          user_id: user.id,
          deleted_at: null,
        }
      }),
    )
    .select()
  verifyResponse(response, 'memberships')

  return response.data!
}
