'use client'

import { createContext, useContext } from 'react'

import { type Course } from '@/lib/api/courses/types'
import { type Locale } from '@/lib/i18n/types'

const COURSE_TABS = ['settings', 'info', 'editor', 'preview'] as const

export type CourseTab = (typeof COURSE_TABS)[number]

export interface CourseContext {
  course: Partial<Course>
  initialCourse: Partial<Course>
  language: Locale
  setCourse: React.Dispatch<React.SetStateAction<Partial<Course>>>
  setLanguage: (language: Locale) => void
  setStep: React.Dispatch<React.SetStateAction<number>>
  setTab: React.Dispatch<React.SetStateAction<CourseTab>>
  step: number
  tab: CourseTab
}

const CourseContext = createContext<CourseContext | undefined>(undefined)

export const CourseProvider = CourseContext.Provider

/**
 * Helper function to create course provider value with immutable initial course.
 * This ensures the initial course is deeply cloned to prevent mutations.
 *
 * @param course - The initial course data
 * @param props - Other course context properties
 * @returns Course context value with immutable initial course
 */
export const createCourseProviderValue = (
  course: Partial<Course>,
  props: Omit<CourseContext, 'initialCourse'>,
): CourseContext => ({
  initialCourse: structuredClone(course),
  ...props,
})

export const useCourse = () => {
  const context = useContext(CourseContext)
  if (!context) throw new Error('useCourse must be used within a CourseProvider')
  return { ...context, tabs: COURSE_TABS }
}
