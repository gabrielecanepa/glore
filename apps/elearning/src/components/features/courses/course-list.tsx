'use client'

import { useCallback, useMemo, useState } from 'react'

import { ArchiveIcon, ArrowDownIcon, ArrowUpIcon, ChevronsUpDown, PlusIcon, XIcon } from 'lucide-react'
import { type Locale } from 'use-intl'

import { toCamelCase } from '@repo/utils/to-camel-case'
import { type SnakeToCamel } from '@repo/utils/types'

import { CourseCard } from '@/components/features/courses/course-card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NoResultsGraphic } from '@/components/ui/graphics/no-results'
import { Link } from '@/components/ui/link'
import { MotionTabs, MotionTabsContent, MotionTabsList, MotionTabsTrigger } from '@/components/ui/motion-tabs'
import { MultiSelect } from '@/components/ui/multi-select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/hooks/use-locale'
import { useSession } from '@/hooks/use-session'
import { useTranslations } from '@/hooks/use-translations'
import { type Course } from '@/lib/api/courses/types'
import { Route } from '@/lib/navigation'
import { cookies } from '@/lib/storage'
import { cn } from '@/lib/utils'

const COURSE_LIST_TABS = {
  editor: ['all', 'published', 'partial', 'draft', 'missing', 'archived'],
  learner: ['all', 'not_started', 'in_progress', 'completed'],
} as const

const COURSE_LIST_SORTS = {
  editor: ['name', 'type'],
  learner: ['name', 'progress', 'type'],
} as const

export type CourseListTab = (typeof COURSE_LIST_TABS.editor)[number] | (typeof COURSE_LIST_TABS.learner)[number]
export type CourseListSort = (typeof COURSE_LIST_SORTS.editor)[number] | (typeof COURSE_LIST_SORTS.learner)[number]
export type CourseListSortOptions = Record<CourseListSort, string>
export type CourseListSortDirection = 'asc' | 'desc'

const CourseListTab = ({ value, ...props }: { count: number; value: CourseListTab }) => {
  const t = useTranslations('Courses')

  const variant = useMemo(() => {
    switch (value) {
      case 'published':
        return 'success'
      case 'partial':
        return 'warning'
      case 'missing':
        return 'destructive'
      default:
        return 'default'
    }
  }, [value])

  return value === 'archived' ? (
    <MotionTabsTrigger badgeProps={{ variant }} className="flex items-center p-0" value={value} {...props}>
      <Tooltip delayDuration={0} disableHoverableContent>
        <TooltipTrigger asChild>
          <span className="inline-block px-3.5">
            <ArchiveIcon />
          </span>
        </TooltipTrigger>
        <TooltipContent arrow={false} sideOffset={10}>
          {t('archive')}
        </TooltipContent>
      </Tooltip>
    </MotionTabsTrigger>
  ) : (
    <MotionTabsTrigger badgeProps={{ variant }} className="flex items-center gap-1" value={value} {...props}>
      {t.flat(value)}
    </MotionTabsTrigger>
  )
}

const CourseListSort = ({
  direction,
  setDirection,
  setValue,
  tab,
  value,
}: {
  direction: CourseListSortDirection | null
  setDirection: React.Dispatch<React.SetStateAction<CourseListSortDirection | null>>
  tab: CourseListTab
  value: CourseListSort | null
  setValue: React.Dispatch<React.SetStateAction<CourseListSort | null>>
}) => {
  const { user } = useSession()
  const t = useTranslations('Common')
  const tCourses = useTranslations('Courses')
  const [open, setOpen] = useState(false)

  const options = useMemo(() => {
    const sorts = user.canEdit ? COURSE_LIST_SORTS.editor : COURSE_LIST_SORTS.learner
    return sorts.reduce((options, sort) => ({ ...options, [sort]: tCourses.flat(sort) }), {} as CourseListSortOptions)
  }, [tCourses, user.canEdit])

  const icon = useMemo(() => {
    if (!value) return <ChevronsUpDown className="size-3.5" />
    const Icon = direction === 'asc' ? ArrowUpIcon : ArrowDownIcon
    return <Icon className="size-3 text-muted-foreground" />
  }, [direction, value])

  const inverseDirection = useMemo(() => (direction === 'asc' ? 'desc' : 'asc'), [direction])

  const handleSortChange = useCallback(
    (sort: CourseListSort) => () => {
      if (sort === value) setDirection(inverseDirection)
      if (!value || value !== sort) setValue(sort)
      setOpen(true)
    },
    [inverseDirection, setDirection, setValue, value],
  )

  const handleSortItemSelect = useCallback((e: Event) => {
    e.preventDefault()
  }, [])

  const clearSort = useCallback(() => {
    setValue(null)
    setDirection(null)
  }, [setDirection, setValue])

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button className="group h-9 gap-0 has-[>svg]:px-3" size="sm" variant="outline">
          <span className="mr-1.5">{t('sortBy')}</span>
          {value && <span className="mr-0.5 text-xs font-medium text-muted-foreground">{options[value]}</span>}
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>{t('sortBy')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(options).map(([key, label]) => {
          const option = key as CourseListSort
          return (
            (option !== 'progress' || (tab !== 'not_started' && tab !== 'completed')) && (
              <DropdownMenuItem
                className={cn(
                  'group/dropdown-menu-item flex h-9 cursor-pointer items-center justify-between',
                  value === option && 'cursor-default bg-accent dark:bg-background/40',
                )}
                key={key}
                onClick={handleSortChange(option)}
                onSelect={handleSortItemSelect}
              >
                <span className={cn('text-foreground/90', value === option && 'text-foreground')}>{label}</span>
                {value === option && (
                  <Button
                    className="size-6 bg-card transition-all duration-75 hover:bg-card hover:shadow-none active:bg-card/50"
                    size="icon"
                  >
                    {direction === 'asc' ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
                  </Button>
                )}
              </DropdownMenuItem>
            )
          )
        })}
        {value && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearSort}>
              <XIcon className="mr-1 size-4" />
              {t('clearSort')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const CourseList = ({
  defaultCoursesLanguage,
  defaultLanguageFilter,
  defaultTab = 'all',
}: {
  defaultCoursesLanguage?: Record<string, Locale>
  defaultLanguageFilter?: Locale[]
  defaultTab?: CourseListTab
}) => {
  const { locale, localeItems, locales, localize } = useLocale()
  const { courses: allCourses, user } = useSession()
  const t = useTranslations('Courses')

  const [activeTab, setActiveTab] = useState<CourseListTab>(defaultTab)
  const [activeSort, setActiveSort] = useState<CourseListSort | null>(null)
  const [languageFilter, setLanguageFilter] = useState<Locale[]>(defaultLanguageFilter ?? locales)
  const [sortDirection, setSortDirection] = useState<CourseListSortDirection | null>(null)

  const pageDescription = useMemo(
    () => (user.isAdmin ? t('descriptionAdmin') : user.isEditor ? t('descriptionEditor') : t('description')),
    [t, user.isAdmin, user.isEditor],
  )

  const sortLanguages = useCallback(
    (langs: Locale[] | null) => langs?.sort((a, b) => locales.indexOf(a) - locales.indexOf(b)) ?? [],
    [locales],
  )

  const activeLanguages = useMemo(() => sortLanguages(languageFilter), [languageFilter, sortLanguages])

  const hasFilters = useMemo(() => activeLanguages.length !== locales.length, [activeLanguages.length, locales.length])

  const getAvailableLanguages = useCallback(
    (course: Course) => {
      const published = sortLanguages(course.publishedLocales)
      const draft = sortLanguages(course.draftLocales)
      return { all: sortLanguages([...published, ...draft]), published, draft }
    },
    [sortLanguages],
  )

  const courses = useMemo<Record<SnakeToCamel<CourseListTab>, Course[]>>(() => {
    const notArchived = allCourses.filter(course => !course.archivedAt)
    const archived = allCourses.filter(course => course.archivedAt)

    const all = notArchived.filter(course =>
      activeLanguages.some(locale => getAvailableLanguages(course).all.includes(locale)),
    )
    const published = all.filter(course => activeLanguages.every(locale => course.publishedLocales?.includes(locale)))
    const partial = all.filter(
      course =>
        activeLanguages.length !== course.publishedLocales?.length &&
        activeLanguages.some(locale => course.publishedLocales?.includes(locale)),
    )
    const draft = all.filter(course =>
      activeLanguages.every(
        locale => !course.publishedLocales?.includes(locale) || course.draftLocales?.includes(locale),
      ),
    )
    const missing = all.filter(course =>
      locales.some(locale => !course.publishedLocales?.includes(locale) && !course.draftLocales?.includes(locale)),
    )

    const visible = notArchived.filter(course =>
      activeLanguages.some(locale => course.publishedLocales?.includes(locale)),
    )
    const notStarted = visible.filter(course => course.progress === 'not_started')
    const inProgress = visible.filter(course => course.progress === 'in_progress')
    const completed = visible.filter(course => course.progress === 'completed')

    return { all, published, partial, draft, missing, archived, notStarted, inProgress, completed }
  }, [allCourses, activeLanguages, getAvailableLanguages, locales])

  const tabs = useMemo<CourseListTab[]>(
    () =>
      user.canEdit
        ? activeLanguages.length > 1
          ? hasFilters
            ? [...COURSE_LIST_TABS.editor]
            : COURSE_LIST_TABS.editor.filter(tab => tab !== 'missing')
          : COURSE_LIST_TABS.editor.filter(tab => tab !== 'partial')
        : [...COURSE_LIST_TABS.learner],
    [user.canEdit, activeLanguages.length, hasFilters],
  )

  const displayedCourses = useMemo(
    () =>
      courses[toCamelCase(activeTab)]
        .map(course => {
          const cookieLanguage = defaultCoursesLanguage?.[String(course.id)]
          if (cookieLanguage && activeLanguages.includes(cookieLanguage)) return { ...course, language: cookieLanguage }
          const langs = getAvailableLanguages(course)
          const lang = langs.all.includes(locale) ? locale : langs.published[0] || langs.draft[0]
          return { ...course, language: lang }
        })
        .sort((a, b) => {
          switch (activeSort) {
            case 'name': {
              const titleA = localize(a.title)
              const titleB = localize(b.title)
              if (!titleA || !titleB) return 0
              return sortDirection === 'asc' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA)
            }
            case 'progress':
              return sortDirection === 'asc' ? a.completion - b.completion : b.completion - a.completion
            case 'type':
              return sortDirection === 'asc' ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type)
            default:
              return a.createdAt < b.createdAt ? 1 : 0
          }
        }),
    [
      activeLanguages,
      activeSort,
      activeTab,
      courses,
      defaultCoursesLanguage,
      getAvailableLanguages,
      locale,
      localize,
      sortDirection,
    ],
  )

  const showCardTooltips = useMemo(() => activeTab !== 'archived', [activeTab])

  const emptyListTitle = useMemo(() => {
    switch (activeTab) {
      case 'published':
        return t('emptyTitlePublished')
      case 'draft':
        return t('emptyTitleDraft')
      case 'archived':
        return t('emptyTitleArchived')
      default:
        return hasFilters ? t('emptyTitleCommon') : t('emptyTitle')
    }
  }, [activeTab, hasFilters, t])

  const enhanceEmptyListMessage = useCallback(
    (message: string) => (hasFilters ? t.markup('withFilters', { message }) : t('atTheMoment', { message })),
    [hasFilters, t],
  )

  const emptyListMessage = useMemo(() => {
    switch (activeTab) {
      case 'published':
        return enhanceEmptyListMessage(t('emptyMessagePublished'))
      case 'draft':
        return enhanceEmptyListMessage(t('emptyMessageDraft'))
      case 'archived':
        return enhanceEmptyListMessage(t('emptyMessageArchived'))
      case 'not_started':
        return t('emptyMessageNotStarted')
      case 'in_progress':
        return t('emptyMessageInProgress')
      case 'completed':
        return t('emptyMessageCompleted')
      default:
        return t('emptyMessage')
    }
  }, [activeTab, enhanceEmptyListMessage, t])

  const handleTabChange = useCallback((value: string) => {
    const tab = value as CourseListTab
    setActiveTab(tab)
    cookies.set('course-list-tab', tab)
  }, [])

  const setActiveLanguages = useCallback(
    (selected: Locale[]) => {
      setLanguageFilter(selected)
      cookies.set('course-list-languages', selected)
      if (activeTab === 'partial' && (selected.length === 1 || courses.partial.length === 0)) setActiveTab('all')
    },
    [activeTab, courses.partial.length],
  )

  return (
    <>
      <div className="pb-2">
        <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>
      <div className="w-full grow py-6">
        <MotionTabs className="h-full" defaultValue="all" onValueChange={handleTabChange} value={activeTab}>
          <div className="mb-4 block justify-between gap-4 xl:flex">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 xl:mb-0 xl:justify-start">
              <MotionTabsList className="w-full sm:w-fit">
                {tabs.map(tab => (
                  <CourseListTab count={courses[toCamelCase(tab)].length} key={tab} value={tab} />
                ))}
              </MotionTabsList>
              {user.canEdit && (
                <Button
                  asChild
                  className="max-sm:w-full"
                  effect="expandIcon"
                  icon={PlusIcon}
                  iconPlacement="right"
                  variant="brand"
                >
                  <Link href={Route.CourseNew} scroll={false}>
                    {t('newCourse')}
                  </Link>
                </Button>
              )}
            </div>
            <div className="flex justify-between gap-2 xl:justify-end">
              <MultiSelect
                className="w-auto"
                contentProps={{
                  className: 'w-36',
                }}
                minItems={{
                  count: 1,
                  message: t('selectAtLeastOneLanguage'),
                }}
                onChange={setActiveLanguages as (selected: string[]) => void}
                options={localeItems}
                placeholder={t('selectLanguages')}
                search={false}
                toastType="warning"
                value={activeLanguages}
              />
              <CourseListSort
                direction={sortDirection}
                setDirection={setSortDirection}
                setValue={setActiveSort}
                tab={activeTab}
                value={activeSort}
              />
            </div>
          </div>
          <MotionTabsContent className="grow space-y-4 pb-2" value={activeTab}>
            {displayedCourses.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center pt-10 text-center">
                <NoResultsGraphic className="mb-8 w-64" />
                <div className="flex flex-col items-center gap-1">
                  <h3 className="text-lg font-medium">{emptyListTitle}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {`${emptyListMessage}.`}
                    {hasFilters && (
                      <>
                        <br />
                        {`${t('updateFilters')}.`}
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {displayedCourses.map(course => (
                  <CourseCard
                    activeLanguages={activeLanguages}
                    course={course}
                    key={course.id}
                    showTooltips={showCardTooltips}
                  />
                ))}
              </div>
            )}
          </MotionTabsContent>
        </MotionTabs>
      </div>
    </>
  )
}
