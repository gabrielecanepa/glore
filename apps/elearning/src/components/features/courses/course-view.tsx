'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useEditorRef, usePlateState } from 'platejs/react'
import { toast } from 'sonner'
import { type Locale } from 'use-intl'

import { log } from '@repo/utils/logger'
import { pick } from '@repo/utils/pick'

import { CourseContent } from '@/components/features/courses/course-content'
import { CourseFooter } from '@/components/features/courses/course-footer'
import { CourseHeader } from '@/components/features/courses/course-header'
import { CourseHeaderMobile } from '@/components/features/courses/course-header-mobile'
import { CourseSidebar } from '@/components/features/courses/course-sidebar'
import { Badge } from '@/components/ui/badge'
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useApi } from '@/hooks/use-api'
import { useHeader } from '@/hooks/use-header'
import { useLocale } from '@/hooks/use-locale'
import { useSearchParams } from '@/hooks/use-search-params'
import { useSession } from '@/hooks/use-session'
import { useSyncState } from '@/hooks/use-sync-state'
import { useTranslations } from '@/hooks/use-translations'
import { type Course } from '@/lib/api/courses/types'
import { LOCALE_ITEMS } from '@/lib/i18n/config'
import { Route } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export const CourseView = (props: { course?: Course }) => {
  const api = useApi()
  const { searchParams, setSearchParam } = useSearchParams()

  const { locale, localize } = useLocale()
  const { courses, setCourses, user } = useSession()
  const t = useTranslations('Courses')

  const editor = useEditorRef()
  const [readOnly, setReadOnly] = usePlateState('readOnly')

  const { setSyncState } = useSyncState()

  const [course, setCourse] = useState<Partial<Course>>(props.course ?? {})

  const updateCourse = useCallback(
    (updater: (course: Course) => Course) => {
      setCourses(courses.map(m => (m.id === course.id ? updater(m) : m)))
    },
    [course.id, setCourses, courses],
  )

  useEffect(() => {
    if (!course.id) return
    const updated = courses.find(({ id }) => id === course.id)
    if (!updated) return
    setCourse(updated)
  }, [courses, course.id])

  const publishedLocales = useMemo(() => course?.publishedLocales ?? [], [course.publishedLocales])
  const draftLocales = useMemo(() => course?.draftLocales ?? [], [course.draftLocales])

  const initialLanguage = useMemo(() => {
    const param = searchParams.get('lang') as Locale | null
    const locales = [...publishedLocales, ...draftLocales]
    if (param && locales.includes(param)) return param
    if (locales.includes(locale)) return locale
    return LOCALE_ITEMS.filter(({ value }) => locales.includes(value))[0]?.value || locale || locales[0]
  }, [searchParams, publishedLocales, draftLocales, locale])

  const [language, setLanguage] = useState<Locale>(initialLanguage)

  useEffect(() => {
    setSearchParam('lang', language)
  }, [language, setSearchParam])

  const isArchived = useMemo(() => !!course.archivedAt, [course.archivedAt])
  const isDraft = useMemo(() => !isArchived && publishedLocales.length === 0, [isArchived, publishedLocales.length])

  useHeader({
    shadow: false,
    header: (
      <BreadcrumbList className="sm:gap-1">
        <BreadcrumbLink href={Route.Courses}>{t('title')}</BreadcrumbLink>
        <BreadcrumbSeparator />
        <BreadcrumbItem className={cn(course.title ? 'text-foreground' : 'text-muted')}>
          {localize(course.title, language)}
          {user.canEdit && isDraft && (
            <Badge className="ml-1" size="xs">
              {t('draft')}
            </Badge>
          )}
          {user.canEdit && isArchived && (
            <Badge className="ml-1" size="xs">
              {t('archived')}
            </Badge>
          )}
        </BreadcrumbItem>
      </BreadcrumbList>
    ),
  })

  const initialStep = useMemo(() => {
    if (!course || course.userStatus === 'completed') return 0
    const incompletedIndex = course.lessons?.findIndex(lesson => !lesson.completed)
    if (incompletedIndex !== -1) return incompletedIndex || 0
    return (course.lessons?.length || 0) - 1
  }, [course])

  const [step, setStep] = useState(initialStep)
  const hasLessons = useMemo(() => course.lessons && course.lessons.length > 0, [course.lessons])
  const currentLesson = useMemo(() => course.lessons?.[step], [course.lessons, step])
  const isFirstLesson = useMemo(() => step === 0, [step])
  const isLastLesson = useMemo(() => step === (course.lessonsCount ?? 0) - 1, [step, course.lessonsCount])

  const isPreview = useMemo(() => !user.canEdit || !!readOnly, [user.canEdit, readOnly])

  const setPreview = useCallback(
    (value: boolean) => {
      setReadOnly(value)
      if (!value) editor.tf.focus()
    },
    [editor, setReadOnly],
  )

  const handlePrevious = useCallback(() => {
    if (isFirstLesson) return
    setStep(i => i - 1)
  }, [isFirstLesson, setStep])

  const handleNext = useCallback(async () => {
    try {
      const lesson = currentLesson
      const index = step

      if (!isLastLesson) setStep(i => i + 1)
      if (course?.completed) return

      updateCourse(course => ({
        ...course,
        lessons: course.lessons?.map((s, i) => (i === index ? { ...s, completed: true } : s)),
        userStatus: isLastLesson ? 'completed' : course.userStatus,
        completed: isLastLesson,
      }))

      setSyncState('syncing')

      if (lesson) await api.courses.completeLesson(lesson.id)

      switch (lesson?.type) {
        case 'questions': {
          const options = lesson.questions?.flatMap(q => q.options.filter(o => o.isUserAnswer).map(o => ({ id: o.id })))
          if (!options || options.length === 0) return
          await api.courses.submitAnswers(pick(options, 'id'))
          break
        }
        case 'evaluations': {
          if (!lesson.evaluations) return
          await api.courses.submitEvaluations(lesson.evaluations.map(e => ({ id: e.id, value: e.userRating! })))
          break
        }
        case 'assessment': {
          const id = lesson.assessment?.id
          const value = lesson.assessment?.userRating
          if (!id || !value) return
          await api.courses.submitAssessment(id, value)
        }
      }
      setCourse(course)
      setSyncState('complete')
    } catch (e) {
      toast.error(t('syncErrorMessage'), {
        dismissible: false,
        position: 'bottom-right',
      })
      setSyncState('error')
      log.error(e)
    }
  }, [currentLesson, step, isLastLesson, updateCourse, course, api.courses, setSyncState, t])

  return (
    <>
      <CourseHeader
        course={course}
        language={language}
        preview={isPreview}
        setLanguage={setLanguage}
        setPreview={setPreview}
        step={step}
        updater={updateCourse}
      />
      <div className="container mx-auto grid grid-cols-1 gap-2 pb-8 md:grid-cols-[minmax(208px,1fr)_3fr]">
        <CourseSidebar course={course} language={language} setStep={setStep} step={step} />

        <div className="flex w-full min-w-0 flex-col">
          <CourseHeaderMobile course={course} language={language} setStep={setStep} step={step} />

          {currentLesson && (
            <>
              <CourseContent
                language={language}
                lesson={currentLesson}
                preview={isPreview}
                setCourse={updateCourse}
                step={step}
              />

              {hasLessons && (
                <CourseFooter
                  lessons={course.lessons}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  status={course.userStatus}
                  step={step}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
