import { notFound } from 'next/navigation'

import { CourseView } from '@/components/features/courses/course-view'
import { createApi } from '@/lib/api/server'
import { getLocale } from '@/lib/i18n/server'
import { localize } from '@/lib/i18n/utils'
import { intlMetadata } from '@/lib/metadata'
import { type PageProps, type Route } from '@/lib/navigation'
import { getCookie } from '@/lib/storage/server'

const getPageData = async ({ params }: PageProps<Route.Course>) => {
  const { slug } = (await params) ?? {}
  if (!slug) return {}

  const { courses, users } = await createApi()
  const user = await users.getCurrent()
  const course = await courses.find(slug)
  if (!course || !user) return notFound()

  return { course, user }
}

export const generateMetadata = async (props: PageProps<Route.Course>) => {
  const { course, user } = await getPageData(props)
  if (!course || !user) return intlMetadata()

  const locale = await getLocale()

  return intlMetadata({
    title: localize(course.title, locale),
    description: localize(course.description, locale),
    translate: false,
  })
}

export default async (props: PageProps<Route.Course>) => {
  const { course, user } = await getPageData(props)
  if (!course || !user) return notFound()

  const api = await createApi()

  if (user.isLearner && !course.enrolled) {
    await api.courses.enrollUser(course.id)
  }

  const tabs = await getCookie('course-view-tab')

  return <CourseView course={course} defaultTab={tabs?.[course.slug]} />
}
