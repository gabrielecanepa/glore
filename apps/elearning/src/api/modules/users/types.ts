import { type Certificate } from '@/api/modules/certificates/types'
import { type BaseOrganization } from '@/api/modules/organizations/types'
import { type Entity } from '@/api/types'
import { type Enums } from 'supabase/types'

export interface BaseUser extends Exclude<Entity<'users'>, 'phone'> {}

export interface User extends Entity<'users', 'created_at' | 'updated_at' | 'deleted_at'> {
  canEdit: boolean
  fullName: string | null
  initials: string[] | null
  isLearner: boolean
  publicLocation: string | null
  organizations: UserOrganization[]
  phone: Entity<'users'>['phone']
}

export interface CurrentUser extends User {
  certificates?: Certificate[]
}

export interface UserOrganization extends BaseOrganization {
  role: Enums<'organization_role'>
}

export interface UserCourse extends Entity<'user_courses'> {}

export interface UserLesson extends Entity<'user_lessons'> {}

export interface UserAnswer extends Entity<'user_answers'> {}

export interface UserEvaluation extends Entity<'user_evaluations'> {}

export interface UserAssessment extends Entity<'user_assessments'> {}
