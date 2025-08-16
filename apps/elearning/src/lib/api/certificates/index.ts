import { parseCertificate } from '@/lib/api/certificates/parser'
import { type DatabaseClient } from '@/lib/api/types'
import { DatabaseError } from '@/lib/db/utils'

import { certificateQuery } from './queries'

export const findCertificate = async (db: DatabaseClient, id: number) => {
  const { data, error } = await db.from('certificates').select(certificateQuery).eq('id', id).single()

  if (error) throw error
  if (!data) throw new DatabaseError('NO_RESULTS')

  return parseCertificate(data)
}

export const listCertificates = async (db: DatabaseClient) => {
  const { data, error } = await db.from('certificates').select(certificateQuery)

  if (error) throw error
  if (!data) throw new DatabaseError('NO_RESULTS')

  return data.map(parseCertificate)
}

export default {
  find: findCertificate,
  list: listCertificates,
}

export * from './types'
