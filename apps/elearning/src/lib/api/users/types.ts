import { type Certificate } from '@/lib/api/certificates/types'
import { type BaseOrganization } from '@/lib/api/organizations/types'
import { type Entity, type Timestamp } from '@/lib/api/types'
import { type Enums } from 'supabase/types'

export interface BaseUser extends Exclude<Entity<'users'>, 'phone'> {}

export interface User extends Entity<'users', never, Timestamp> {
  canEdit: boolean
  fullName: string | null
  initials: string[] | null
  isLearner: boolean
  organizations: UserOrganization[]
  phone: Entity<'users'>['phone']
  shortName: string | null
}

export interface CurrentUser extends User {
  certificates?: Certificate[]
}

export interface UserOrganization extends BaseOrganization {
  role: Enums<'role'>
}

export interface UserCourse extends Entity<'user_courses'> {}

export interface UserLesson extends Entity<'user_lessons'> {}

export interface UserAnswer extends Entity<'user_answers'> {}

export interface UserEvaluation extends Entity<'user_evaluations'> {}

export interface UserAssessment extends Entity<'user_assessments'> {}
