import { notFound } from 'next/navigation'

import { api } from '@/api/client'
import { CourseView } from '@/components/features/course-view'
import { generateLocalizedMetadata } from '@/lib/metadata'

export default async () => {
  const user = await api.users.getCurrent()
  if (!user || (!user.isAdmin && !user.isEditor)) return notFound()
  return <CourseView />
}

export const generateMetadata = generateLocalizedMetadata({
  title: 'Courses.newCourse',
})
