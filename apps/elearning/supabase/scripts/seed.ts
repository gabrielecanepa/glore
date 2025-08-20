import { log } from '@repo/utils/logger'

import { createIncludes, logEntities, resetDatabase } from 'supabase/seeds/config/utils'
import { seedCourses } from 'supabase/seeds/course'
import { seedMemberships } from 'supabase/seeds/membership'
import { seedOrganizations } from 'supabase/seeds/organization'
import { seedUsers } from 'supabase/seeds/user'

const args = process.argv.slice(2)
const reset = !args.includes('--skip-reset')

const includes = createIncludes(args)

void (async () => {
  try {
    if (reset) {
      await resetDatabase()
      log.success('Database reset')
    }

    const users = await seedUsers()
    logEntities({ users })

    if (includes('org') || includes('organization')) {
      const organizations = await seedOrganizations()
      logEntities({ organizations })

      if (includes('membership')) {
        const memberships = await seedMemberships(organizations[0], users)
        logEntities({ memberships })
      }
    }

    if (includes('courses')) {
      const courses = await seedCourses({ users })
      logEntities({ courses })
    }

    process.exit(0)
  } catch (error) {
    log.error('An error occurred')
    throw error as Error
  }
})()
