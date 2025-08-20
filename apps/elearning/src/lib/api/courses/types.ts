import { type Enum } from '@repo/utils/types'

import type { Entity, Timestamp } from '@/lib/api/types'
import { type User } from '@/lib/api/users/types'
import { type Enums } from 'supabase/types'

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
  type: Enums<'course_type'>
  skillGroup: SkillGroup
  creator: User
  contributions: LessonContribution[]
  contributors: User[] & { count?: number }
  status: Enum<CourseStatus>
  lessons: Lesson[]
  enrolled: boolean
  completion: number
  progress: Enum<CourseProgress>
  completed: boolean
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
  type: Enum<LessonType>
  questions?: Question[]
  assessment?: Assessment
  evaluations?: Evaluation[]
  completed: boolean
  contributions: LessonContribution[]
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
