import { NextResponse } from 'next/server'

import { createDatabase } from '@/lib/db/server'

interface HealthResponse {
  db: boolean
}

export const GET = async () => {
  const db = await createDatabase()

  const { error, status } = await db.from('courses').select('').limit(1)

  return NextResponse.json<HealthResponse>({ db: !error }, { status })
}
