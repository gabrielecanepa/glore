'use client'

import { useCallback, useContext, useState } from 'react'

import { SessionContext } from '@/components/providers/session-provider'
import { useApi } from '@/hooks/use-api'
import { type Course, type CourseCreate, type CourseUpdate } from '@/lib/api/courses'
import { type CurrentUser, type UserOrganization } from '@/lib/api/users'

/**
 * Hook to access the session context.
 *
 * It provides the current session data and methods to manage the session.
 */
export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used within a SessionProvider')

  const api = useApi()
  const [courses, setCourses] = useState<Course[]>(context.courses)
  const [user, setUser] = useState<CurrentUser>(context.user)
  const [organization, _setOrganization] = useState<UserOrganization | undefined>(context.organization)

  const setCourse = useCallback((course: Course) => {
    setCourses(courses => {
      const index = courses.findIndex(({ id }) => id === course.id)
      if (index === -1) return [...courses, course]
      courses[index] = course
      return courses
    })
  }, [])

  const createCourse = useCallback(
    async (payload: CourseCreate) => {
      const course = await api.courses.create(payload)
      setCourse(course)
      return course
    },
    [api.courses, setCourse],
  )

  const updateCourse = useCallback(
    async (value: React.SetStateAction<CourseUpdate>) => {
      const payload = typeof value === 'function' ? value((value.arguments as CourseUpdate[])[0]) : value
      const course = await api.courses.update(payload)
      setCourse(course)
      return course
    },
    [api.courses, setCourse],
  )

  return {
    courses,
    createCourse,
    updateCourse,
    user,
    setUser,
    organization,
  }
}
