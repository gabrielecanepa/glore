import { type Enum } from '@repo/utils/types'

import type { Entity, Timestamp } from '@/lib/api/types'
import { type User } from '@/lib/api/users/types'
import { type Enums, type Tables } from 'supabase/types'

export interface SkillGroup extends Entity<'skill_groups'> {}

export enum CourseStatus {
  Draft = 'draft',
  Partial = 'partial',
  Published = 'published',
  Archived = 'archived',
}

export enum CourseProgress {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Completed = 'completed',
}

export interface Course extends Entity<'courses', 'title' | 'description', Timestamp> {
  completed: boolean
  completion: number
  contributions: LessonContribution[]
  contributors: User[] & { count?: number }
  creator: User
  enrolled: boolean
  languages: Enums<'language'>[]
  lessons: Lesson[]
  progress: Enum<CourseProgress>
  skillGroup: SkillGroup
  status: Enum<CourseStatus>
  type: Enums<'course_type'>
}

export interface CourseCreate extends Omit<Tables<'courses'>, 'id'> {}

export interface CourseUpdate extends Partial<Tables<'courses'>> {
  id: number
}

export enum LessonType {
  Reading = 'reading',
  Questions = 'questions',
  Evaluations = 'evaluations',
  Assessment = 'assessment',
}

export interface LessonContribution extends Entity<'contributions', never, Timestamp> {
  user: User
}

export interface Lesson extends Entity<'lessons', 'title' | 'content', Timestamp> {
  assessment?: Assessment
  completed: boolean
  contributions: LessonContribution[]
  evaluations?: Evaluation[]
  questions?: Question[]
  type: Enum<LessonType>
}

export interface Question extends Entity<'questions', 'description' | 'explanation'> {
  answered: boolean
  options: QuestionOption[]
}

export interface QuestionOption extends Entity<'question_options', 'content'> {
  isUserAnswer: boolean
}

export interface Evaluation extends Entity<'evaluations', 'description'> {
  userRating?: number
}

export interface Assessment extends Entity<'assessments', 'description'> {
  userRating?: number
}
