'use client'

import { useCallback, useMemo } from 'react'

import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { useCourse } from '@/hooks/use-course'
import { useLocale } from '@/hooks/use-locale'
import { useScroll } from '@/hooks/use-scroll'
import { useTranslations } from '@/hooks/use-translations'
import { cn } from '@/lib/utils'

export const CourseHeaderMobile = () => {
  const { course, language, setStep, step } = useCourse()
  const { localize } = useLocale()
  const { scrolled } = useScroll()
  const t = useTranslations('Courses')

  const currentLesson = useMemo(() => course.lessons?.[step], [course.lessons, step])
  const progressColor = useMemo(() => (course.completion === 100 ? 'success' : 'default'), [course.completion])

  const formatLessonType = useCallback((type: string) => t('lessonType', { type }), [t])

  const isCurrentLesson = useCallback((index: number) => index === step, [step])
  const isCompletedLesson = useCallback((index: number) => !!course.lessons?.[index].completed, [course.lessons])

  return (
    <div className={cn('sticky top-[72px] flex flex-col gap-4 bg-background pb-4 md:hidden', scrolled && 'border-b')}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full justify-between py-6" variant="outline">
            <div className="flex flex-col items-start">
              {currentLesson ? (
                <>
                  <span className="font-medium">{localize(currentLesson.title, language)}</span>
                  <span className="text-xs text-muted-foreground">{formatLessonType(currentLesson.type)}</span>
                </>
              ) : (
                <span className="font-medium">{'No lessons'}</span>
              )}
            </div>
            <ChevronDownIcon className="size-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {course.lessons ? (
            course.lessons.map((lesson, index) => (
              <DropdownMenuItem className="flex justify-between py-2" key={lesson.id} onClick={() => setStep(index)}>
                <div className="flex flex-col">
                  <span className={cn(isCurrentLesson(index) && 'font-semibold')}>
                    {localize(lesson.title, language)}{' '}
                    {isCompletedLesson(index) && <span className="ml-1 text-xs text-success">{'✔︎'}</span>}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatLessonType(lesson.type)}</span>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem className="flex justify-between py-2">
              <div className="flex flex-col">
                <span>{'Add lesson'}</span>
              </div>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {course.progress !== 'completed' && (
        <div className="flex items-center justify-end gap-2 bg-background md:top-[72px]">
          <span className="text-sm">
            {course.completion}
            {'%'}
          </span>
          <Progress className="md:max-w-sm" color={progressColor} value={course.completion} />
        </div>
      )}
    </div>
  )
}
