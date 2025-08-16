import { redirect } from 'next/navigation'

import { log } from '@repo/utils/logger'

import { type DatabaseClient } from '@/lib/api/types'
import { Route } from '@/lib/navigation'

import { organizationQuery } from './queries'
import { type Organization } from './types'

export const findOrganization = async (db: DatabaseClient, id: number): Promise<Organization> => {
  const { data, error, status } = await db.from('organizations').select(organizationQuery).eq('id', id).single()

  if ((error && status !== 406) || !data) {
    if (error) log.error(error)
    redirect(Route.Login)
  }

  return data as Organization
}

export default {
  find: findOrganization,
}

export * from './types'
