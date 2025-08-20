'use client'

import { useCallback, useMemo } from 'react'

import { ArcherContainer, ArcherElement } from 'react-archer'
import { type RelationType } from 'react-archer/lib/types'

import { useLocale } from '@/hooks/use-locale'
import { useSession } from '@/hooks/use-session'
import { useTranslations } from '@/hooks/use-translations'
import { type Course } from '@/lib/api/courses/types'
import { type IntlRecord, type Locale } from '@/lib/i18n/types'
import { cn } from '@/lib/utils'

export const CourseSidebar = ({
  course,
  language,
  setStep,
  step,
}: {
  course: Partial<Course>
  language: Locale
  setStep: (value: number) => void
  step: number
}) => {
  const { localize } = useLocale()
  const { user } = useSession()
  const t = useTranslations('Courses')

  const hasLessons = useMemo(() => course.lessons && course.lessons.length > 0, [course.lessons])

  const isCurrent = useCallback((index: number) => index === step, [step])
  const isPast = useCallback((index: number) => index < step, [step])
  const isFuture = useCallback((index: number) => index > step, [step])
  const isCompleted = useCallback((index: number) => !!course.lessons?.[index].completed, [course.lessons])
  const isReachable = useCallback(
    (index: number) => {
      if (isCurrent(index)) return true
      if (isPast(index)) return true
      if (isFuture(index) && isCompleted(index - 1)) return true
      return false
    },
    [isCurrent, isPast, isFuture, isCompleted],
  )

  const formatLessonTitle = useCallback(
    (title: IntlRecord) => {
      const localized = localize(title, language)
      return <span className={cn(!localized && 'text-muted-foreground/50')}>{localized ?? t('untitledLesson')}</span>
    },
    [localize, language, t],
  )

  const formatLessonType = useCallback(
    (type: string) =>
      t('lessonType', {
        type,
      }),
    [t],
  )

  const formatLessonMessage = useCallback(
    (index: number) => {
      if (isReachable(index)) return undefined
      return t('completeLessonsToProceed')
    },
    [isReachable, t],
  )

  const getRelations = useCallback(
    (index: number): RelationType[] =>
      index >= step
        ? []
        : [
            {
              sourceAnchor: 'bottom',
              targetAnchor: 'top',
              style: {
                strokeColor: 'var(--brand)',
                endMarker: false,
              },
              targetId: `${index + 1}`,
            },
          ],
    [step],
  )

  const onLessonClick = useCallback(
    (index: number) => {
      if (!isReachable(index)) return
      setStep(index)
    },
    [isReachable, setStep],
  )

  return (
    <div className="hidden md:block">
      <div className="sticky top-[120px] space-y-2 pr-2">
        {hasLessons && (
          <ArcherContainer>
            <div className="relative">
              {course.lessons?.map((lesson, index) => (
                <div
                  className={cn(
                    'relative mb-4 flex cursor-pointer items-center rounded-md p-3 pl-12',
                    isCurrent(index) && 'pointer-events-none bg-accent/50 dark:bg-accent/30',
                    isReachable(index) && 'hover:bg-accent/40 dark:hover:bg-accent/20',
                    !isReachable(index) && 'cursor-not-allowed text-muted-foreground',
                  )}
                  key={index}
                  onClick={onLessonClick.bind(null, index)}
                  title={formatLessonMessage(index)}
                >
                  <div
                    className={cn(
                      'absolute top-1/2 left-6 z-10 flex size-6 -translate-1/2 items-center justify-center rounded-full border',
                      isCurrent(index) || isPast(index)
                        ? 'border-brand-accent bg-brand text-brand-foreground'
                        : 'border-border bg-background',
                    )}
                  >
                    <ArcherElement id={String(index)} key={lesson.id} relations={getRelations(index)}>
                      <span className="text-xs">{index + 1}</span>
                    </ArcherElement>
                  </div>
                  <div className={cn('flex-1 opacity-85', isCurrent(index) && 'opacity-100')}>
                    <span className="inline-block text-sm font-medium">
                      {formatLessonTitle(lesson.title)}
                      {user.isLearner && isCompleted(index) && (
                        <span className="ml-1 text-xs text-success">{' ✔︎'}</span>
                      )}
                    </span>
                    <p className="text-xs opacity-80">{formatLessonType(lesson.type)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ArcherContainer>
        )}
      </div>
    </div>
  )
}
