import { courseQuery } from '@/lib/api/courses/queries'
import { organizationQuery } from '@/lib/api/organizations/queries'
import { baseUserQuery } from '@/lib/api/users/queries'
import { timestamps } from '@/lib/api/utils'

export const certificateQuery = `
  id,
  handle,
  language,
  activityStartDate:activity_start_date,
  activityEndDate:activity_end_date,
  activityDuration:activity_duration,
  activityLocation:activity_location,
  activityDescription:activity_description,
  organizationRating:organization_rating,
  reviewerComment:reviewer_comment,
  documentUrl:document_url,
  issuedAt:issued_at,
  ${timestamps},
  skills:courses (
    ${courseQuery}
  ),
  organization:organizations (
    ${organizationQuery}
  ),
  reviewer:users!user_id (
    ${baseUserQuery}
  )
`
