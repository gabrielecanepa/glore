'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { BookOpenIcon, DraftingCompassIcon, Edit3Icon, UserPenIcon } from 'lucide-react'
import { type IconName } from 'lucide-react/dynamic'
import { useFormatter } from 'use-intl'

import { truncate, TRUNCATE_SYMBOL } from '@repo/utils/truncate'

import { UserCard } from '@/components/features/users/user-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { DynamicIcon } from '@/components/ui/icons/dynamic'
import { Link } from '@/components/ui/link'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger, type TooltipContentProps } from '@/components/ui/tooltip'
import { useLocale } from '@/hooks/use-locale'
import { useSession } from '@/hooks/use-session'
import { useTranslations } from '@/hooks/use-translations'
import { type Course } from '@/lib/api/courses/types'
import { type IntlRecord, type Locale, type LocaleItem } from '@/lib/i18n/types'
import { route } from '@/lib/navigation'
import { cookies } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface LanguageItem extends LocaleItem {
  active: boolean
  setLanguage: (value: Locale) => void
  showTooltip: boolean
  tooltipProps?: TooltipContentProps
}

const CourseCardLanguage = ({
  active,
  className,
  displayLabel,
  icon,
  setLanguage,
  showTooltip,
  tooltipProps,
  value,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & LanguageItem) => {
  const t = useTranslations('Courses')

  const handleClick = useCallback(() => {
    if (active) return
    setLanguage(value)
  }, [active, setLanguage, value])

  const trigger = useMemo(
    () => (
      <Button
        className={cn('text-base leading-[1]', active ? 'pointer-events-none cursor-default' : 'opacity-40', className)}
        onClick={handleClick}
        size="text"
        variant="transparent"
        {...props}
      >
        {icon}
      </Button>
    ),
    [active, className, handleClick, icon, props],
  )

  if (active || !showTooltip) return trigger

  return (
    <Tooltip delayDuration={500} disableHoverableContent>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent arrow={false} size="sm" {...tooltipProps}>
        {`${t('seeIn')} ${displayLabel}`}
      </TooltipContent>
    </Tooltip>
  )
}

export const CourseCard = ({
  activeLanguages,
  course,
  showTooltips = true,
}: {
  activeLanguages: Locale[]
  course: Course & {
    language: Locale
  }
  showTooltips?: boolean
}) => {
  const { locale, localeItems, locales, localize } = useLocale()
  const { user } = useSession()
  const t = useTranslations('Courses')
  const f = useFormatter()

  const [language, setLanguage] = useState(course.language)

  const translate = useCallback((record: IntlRecord) => localize(record, language), [localize, language])

  const updateLanguage = useCallback(
    (value: Locale) => {
      if (value === language) return
      setLanguage(value)
      const languageCookie = cookies.get('course-card-language') || {}
      languageCookie[course.slug] = value
      cookies.set('course-card-language', languageCookie)
    },
    [course.slug, language],
  )

  const getCoursePath = useCallback(
    (lang: Locale) => route('/courses/:slug', { slug: course.slug }, { lang }),
    [course.slug],
  )

  const coursePath = useMemo(() => getCoursePath(language), [getCoursePath, language])

  const languageItems = useMemo(
    () =>
      localeItems
        .reduce(
          (items, item) =>
            activeLanguages.includes(item.value)
              ? [
                  ...items,
                  {
                    ...item,
                    active: item.value === language,
                    setLanguage: updateLanguage,
                    showTooltip: showTooltips,
                  },
                ]
              : items,
          [] as LanguageItem[],
        )
        .sort((a, b) => locales.indexOf(a.value) - locales.indexOf(b.value)),
    [activeLanguages, language, localeItems, locales, showTooltips, updateLanguage],
  )

  const publishedLanguageItems = useMemo(
    () => languageItems.filter(({ value }) => course.publishedLocales?.includes(value)),
    [course.publishedLocales, languageItems],
  )

  const draftLanguageItems = useMemo(
    () => languageItems.filter(({ value }) => course.draftLocales?.includes(value)),
    [course.draftLocales, languageItems],
  )

  const missingLanguageItems = useMemo(
    () =>
      languageItems.filter(
        ({ value }) => !course.publishedLocales?.includes(value) && !course.draftLocales?.includes(value),
      ),
    [course.publishedLocales, course.draftLocales, languageItems],
  )

  const visibleLanguages = useMemo(
    () => [...(course.publishedLocales ?? []), ...(course.draftLocales ?? [])],
    [course.publishedLocales, course.draftLocales],
  )

  const isPublished = useMemo(
    () => publishedLanguageItems.length === languageItems.length,
    [publishedLanguageItems.length, languageItems.length],
  )

  const isPartial = useMemo(
    () => publishedLanguageItems.length > 0 && publishedLanguageItems.length < languageItems.length,
    [publishedLanguageItems.length, languageItems.length],
  )

  const title = useMemo(() => translate(course.title), [course.title, translate])

  const description = useMemo(() => {
    const courseDescription = translate(course.description)
    if (!courseDescription) return undefined
    return courseDescription.length > 150 ? (
      <>
        {truncate(courseDescription, 150, { ellipsis: '' })}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">{TRUNCATE_SYMBOL}</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px] text-sm" side="top" sideOffset={4}>
            {courseDescription}
          </TooltipContent>
        </Tooltip>
      </>
    ) : (
      courseDescription
    )
  }, [course.description, translate])

  const noDraftsMessage = useMemo(() => {
    if (languageItems.length === publishedLanguageItems.length)
      return (
        <>
          {t('allLanguagesPublished')} <span className="text-muted-foreground/80">{'🎉'}</span>
        </>
      )
    return t('noDrafts')
  }, [languageItems.length, publishedLanguageItems.length, t])

  const lessonsCount = useMemo(() => course.lessons?.length, [course.lessons])

  const lessonsMessage = useMemo(() => {
    if (lessonsCount > 0) return `${lessonsCount} ${t('lessons', { count: lessonsCount })}`
    return user.canEdit ? t('noLessonsCreated') : t('noLessons')
  }, [lessonsCount, t, user.canEdit])

  const createdOn = useMemo(
    () =>
      t('createdOnBy', {
        date: f.relativeTime(new Date(course.createdAt), Date.now()),
      }),
    [course.createdAt, f, t],
  )

  const completedLessons = useMemo(
    () => course.lessons?.filter(lesson => lesson.completed).length ?? 0,
    [course.lessons],
  )

  const action = useMemo(() => {
    if (user.canEdit) return t('editCourse')
    if (!course.enrolled) return t('startCourse')
    if (course.completed) return t('reviewCourse')
    return t('continueCourse')
  }, [course.enrolled, course.completed, t, user.canEdit])

  useEffect(() => {
    if (activeLanguages.includes(language)) return
    updateLanguage(visibleLanguages.includes(locale) ? locale : activeLanguages[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLanguages])

  return (
    <Card className="min-h-80">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-2.5">
            <DynamicIcon
              className={cn(
                'size-4 shrink-0 stroke-muted-foreground/80',
                isPartial && 'stroke-warning',
                isPublished && 'stroke-success',
              )}
              name={course.icon as IconName}
              placeholder={Skeleton}
              placeholderProps={{ className: 'size-4 shrink-0' }}
            />
            <div className="flex grow flex-col gap-0.5">
              <div className="-mt-0.5 flex">
                <Link
                  className={cn(
                    'text-base leading-[normal]',
                    title ? 'font-semibold' : 'font-medium text-muted-foreground/50',
                  )}
                  href={coursePath}
                  title={t('viewCourse')}
                >
                  {title ?? t('noTitle')}
                </Link>
                {user.isLearner && course.completed && <span className="ml-0.5 text-success">{' ✔︎'}</span>}
              </div>
              {course.skillGroup && (
                <span className="text-xs font-medium text-muted-foreground">
                  {translate(course.skillGroup.name as IntlRecord)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {publishedLanguageItems.map(item => (
              <CourseCardLanguage key={item.value} {...item} />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="mb-0.5">
        <p className={cn('text-sm', description ? 'text-muted-foreground' : 'text-muted-foreground/50')}>
          {description}
        </p>
      </CardContent>
      <CardFooter className="flex grow flex-col justify-end gap-4">
        <div className="flex flex-col gap-2">
          {/* Drafts */}
          {user.canEdit && (
            <>
              <div className="flex items-center gap-2.5 text-xs font-normal text-muted-foreground">
                <DraftingCompassIcon className="size-3.5 text-muted-foreground" />
                {draftLanguageItems.length + missingLanguageItems.length > 0 ? (
                  <div className="flex items-center gap-1">
                    {draftLanguageItems.length > 0 && (
                      <>
                        {t('draftIn')}
                        {draftLanguageItems.map(item => (
                          <CourseCardLanguage
                            className="text-sm"
                            key={item.value}
                            tooltipProps={{ size: 'xs', sideOffset: 2 }}
                            {...item}
                          />
                        ))}
                      </>
                    )}
                    {missingLanguageItems.length > 0 && (
                      <>
                        {draftLanguageItems.length > 0 ? (
                          <span>{`– ${t('missingIn').toLowerCase()}`}</span>
                        ) : (
                          t('missingIn')
                        )}
                        {missingLanguageItems.map(({ displayLabel, icon, value }) => (
                          <Tooltip delayDuration={250} disableHoverableContent key={value}>
                            <TooltipTrigger asChild>
                              <Button
                                className="text-sm leading-[1] opacity-40 hover:opacity-100"
                                size="text"
                                variant="transparent"
                              >
                                <Link href={getCoursePath(value)}>{icon}</Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent arrow={false} sideOffset={2} size="xs">
                              {`${t('createIn')} ${displayLabel}`}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <span className="pointer-events-none text-muted-foreground/50 select-none">{noDraftsMessage}</span>
                )}
              </div>
            </>
          )}
          <div
            className={cn(
              'flex items-center gap-2.5 text-xs font-normal',
              lessonsCount ? 'text-muted-foreground' : 'pointer-events-none text-muted-foreground/50 select-none',
            )}
          >
            <BookOpenIcon className="size-3.5 text-muted-foreground" />
            {lessonsMessage}
          </div>
          {user.canEdit && (
            <div className="flex items-center gap-2.5 text-xs font-normal text-muted-foreground">
              <UserPenIcon className="size-3.5 text-muted-foreground" />
              <div className="flex items-center gap-1.5">
                <span>{createdOn}</span>
                <HoverCard closeDelay={50} openDelay={300}>
                  <HoverCardTrigger asChild>
                    <Button
                      className={`
                        peer/user-card cursor-default gap-1 pr-0.5 text-xs font-normal text-muted-foreground
                        data-[state=open]:bg-accent/80 data-[state=open]:text-accent-foreground
                        dark:data-[state=open]:bg-accent/50
                      `}
                      size="text"
                      variant="ghost"
                    >
                      <Avatar className="size-3.5 rounded-full">
                        {course.creator.avatarUrl && (
                          <AvatarImage className="rounded-full" src={course.creator.avatarUrl} />
                        )}
                        <AvatarFallback>{user.initials}</AvatarFallback>
                      </Avatar>
                      {course.creator.shortName}
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="bg-popover" side="top">
                    <UserCard user={course.creator} />
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2.5 text-xs font-normal text-muted-foreground">
            <Edit3Icon className="size-3.5 text-muted-foreground" />
            <div className="flex items-center gap-1.5">
              <span>{t('writtenBy')}</span>
              <div className="flex -space-x-0.5 hover:space-x-1">
                {course.contributors.map(user => (
                  <HoverCard closeDelay={50} key={user.id} openDelay={300}>
                    <HoverCardTrigger asChild>
                      <Avatar className="size-3.5 rounded-full ring-2 ring-background transition-all duration-200 ease-in-out">
                        {user.avatarUrl && <AvatarImage className="rounded-full" src={user.avatarUrl} />}
                        <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
                      </Avatar>
                    </HoverCardTrigger>
                    <HoverCardContent className="bg-popover" side="top">
                      <UserCard user={user} />
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
          </div>
        </div>
        {!user.canEdit && course.enrolled && (
          <div className="w-full">
            <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center">
                {completedLessons}
                {' / '}
                {course.lessons.length} {t('lessons', { count: course.lessons.length })}
              </span>
              <span>
                {course.completion}
                {'% '}
                {t('completed').toLowerCase()}
              </span>
            </div>
            <Progress className="h-1.5" value={course.completion} />
          </div>
        )}
        <Button asChild className="w-full" variant="outline">
          <Link href={coursePath}>{action}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
