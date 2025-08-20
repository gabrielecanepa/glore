import { type certificateQuery } from '@/lib/api/certificates/queries'
import { type Certificate } from '@/lib/api/certificates/types'
import { parseCourse } from '@/lib/api/courses/parser'
import { createParser } from '@/lib/api/utils'

export const parseCertificate = createParser<'certificates', typeof certificateQuery, Certificate>(
  ({ skills, ...certificate }) =>
    ({
      ...certificate,
      skills: skills.map(parseCourse),
    }) as Certificate,
)
