import { client, STORAGE_URL } from './config/client'
import { organization } from './config/data'
import { verifyResponse } from './config/utils'

export const seedOrganizations = async () => {
  const { avatar, memberships, ...rest } = organization
  const now = new Date().toISOString()
  const rating = Math.round(Math.random() * 5 * 100) / 100
  const avatarUrl = STORAGE_URL ? `${STORAGE_URL}/${avatar}` : undefined

  const response = await client
    .from('organizations')
    .insert({
      ...rest,
      avatar_url: avatarUrl,
      rating,
      approved_at: now,
      deleted_at: null,
    })
    .select()
  verifyResponse(response, 'memberships')
  return response.data!
}
