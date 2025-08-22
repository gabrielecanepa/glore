import { CourseList } from '@/components/features/courses/course-list'
import { createMetadata } from '@/lib/metadata'
import { getCookie } from '@/lib/storage/server'

export const generateMetadata = createMetadata({
  title: 'Navigation.courses',
})

export default async () => {
  const coursesLanguage = await getCookie('course-language')
  const languageFilter = await getCookie('course-list-languages')
  const tab = await getCookie('course-list-tab')

  return <CourseList defaultCoursesLanguage={coursesLanguage} defaultLanguageFilter={languageFilter} defaultTab={tab} />
}
