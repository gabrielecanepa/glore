'use client'

import { useCallback, useMemo } from 'react'

import { EyeIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LanguageSelect } from '@/components/ui/language-select'
import { MotionTabsList, MotionTabsTrigger } from '@/components/ui/motion-tabs'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCourse } from '@/hooks/use-course'
import { useScroll } from '@/hooks/use-scroll'
import { useSession } from '@/hooks/use-session'
import { useTranslations } from '@/hooks/use-translations'
import { type Locale } from '@/lib/i18n/types'
import { cn } from '@/lib/utils'

export const CourseHeader = () => {
  const { course, language, setLanguage, step, tab, tabs } = useCourse()
  const { scrolled } = useScroll()
  const { user } = useSession()
  const t = useTranslations('Courses')

  const hasLessons = useMemo(() => course.lessons && course.lessons.length > 0, [course.lessons])
  const progressColor = useMemo(() => (course.completion === 100 ? 'success' : 'default'), [course.completion])

  const showLanguage = useMemo(() => tab !== 'settings', [tab])

  const onLanguageChange = useCallback(
    (language: Locale) => {
      setLanguage(language)
    },
    [setLanguage],
  )

  return (
    <div
      className={cn(
        'sticky top-36 z-50 hidden w-full items-center justify-between gap-2 bg-background px-1 pb-4 md:top-[72px] md:flex',
        scrolled && 'border-b',
      )}
    >
      {user.canEdit ? (
        <>
          <div className="flex items-center gap-2">
            <MotionTabsList className="w-full sm:w-fit">
              {tabs.map(tab => (
                <MotionTabsTrigger className="flex items-center gap-1" key={tab} value={tab}>
                  {t(tab)}
                </MotionTabsTrigger>
              ))}
            </MotionTabsList>
            {showLanguage && (
              <LanguageSelect
                contentProps={{ className: 'min-w-40' }}
                controlled
                onChange={onLanguageChange}
                value={language}
              />
            )}
          </div>
          {showLanguage && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                {t('saveDraft')}
              </Button>
              <Button size="sm" variant="success">
                {t('publish')}
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex h-full items-center gap-2">
            <span className="pt-1 text-sm text-muted-foreground">
              {hasLessons
                ? t('lessonCount', {
                    count: String(step + 1),
                    total: String(course.lessons?.length || 0),
                  })
                : ''}
            </span>
          </div>
          {user.isLearner && (
            <>
              {course.progress === 'completed' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      className="mr-2 cursor-help rounded-full border-muted-foreground/60 p-1.5 text-muted-foreground/90"
                      variant="outline"
                    >
                      <EyeIcon className="size-4 text-muted-foreground" />
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent arrow={false} className="max-w-72 text-center" side="bottom">
                    {t('reviewModeMessage')}
                  </TooltipContent>
                </Tooltip>
              )}
              <span className="text-sm">
                {course.progress}
                {'%'}
              </span>
              <Progress className="md:max-w-sm" color={progressColor} value={course.completion} />
            </>
          )}
        </>
      )}
    </div>
  )
}
