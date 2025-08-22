'use client'

import { useCallback, useMemo, useTransition } from 'react'

import { Tooltip } from '@radix-ui/react-tooltip'
import { CircleDashedIcon, CircleIcon, PlusIcon } from 'lucide-react'
import { type Locale } from 'use-intl'

import { Loader } from '@/components/ui/icons/loader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  type SelectContentProps,
  type SelectTriggerProps,
} from '@/components/ui/select'
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/hooks/use-locale'
import { useTranslations } from '@/hooks/use-translations'
import { LOCALE_ITEMS } from '@/lib/i18n/config'
import { type LocaleItem } from '@/lib/i18n/types'
import { cn } from '@/lib/utils'
import config from 'config/app.json'

const DEFAULT_VALUES = Object.keys(config.locales) as Locale[]

interface LanguageSelectItem extends LocaleItem {
  badge?: React.ReactNode
  status?: string | null
}

export interface LanguageSelectProps extends Omit<SelectTriggerProps, 'onChange'> {
  addLanguage?: (locale: Locale) => void
  contentProps?: SelectContentProps
  controlled?: boolean
  onChange?: (locale: Locale) => void
  status?: {
    published?: Locale[]
    draft?: Locale[]
  }
  value?: Locale
  values?: Locale[]
}

export const LanguageSelect = ({
  addLanguage,
  className,
  contentProps,
  controlled = false,
  onChange,
  status,
  value,
  values = DEFAULT_VALUES,
  ...props
}: LanguageSelectProps) => {
  const { locale, setLocale } = useLocale()
  const [isPending, startTransition] = useTransition()
  const tCommon = useTranslations('Common')
  const tCourses = useTranslations('Courses')
  const tLanguages = useTranslations('Languages')

  const withStatus = useCallback(
    (locale: Locale) => {
      if (!status) return {}
      if (status.published?.includes(locale))
        return {
          badge: <CircleIcon className="size-2.5 fill-success stroke-none" />,
          status: tCourses('publishedSingle'),
        }
      if (status.draft?.includes(locale))
        return {
          badge: <CircleIcon className="size-2.5 fill-muted-foreground stroke-none" />,
          status: tCourses('draft'),
        }
      return { badge: <CircleDashedIcon className="size-2.5 text-muted-foreground" />, status: tCourses('notCreated') }
    },
    [status, tCourses],
  )

  const getStatusPriority = useCallback(
    (locale: Locale): number => {
      if (!status) return 0
      if (status.published?.includes(locale)) return 1
      if (status.draft?.includes(locale)) return 2
      return 3
    },
    [status],
  )

  const items = useMemo<LanguageSelectItem[]>(() => {
    const localeItems = LOCALE_ITEMS.filter(item => values.includes(item.value)).map(item => ({
      ...item,
      label: tLanguages(item.value),
    }))
    if (!status) return localeItems
    const itemsWithStatus = localeItems.map(item => ({ ...item, ...withStatus(item.value) }))
    return itemsWithStatus.sort((a, b) => getStatusPriority(a.value) - getStatusPriority(b.value))
  }, [getStatusPriority, status, tLanguages, values, withStatus])

  const publishedAndDraftItems = useMemo(() => {
    if (!status) return items
    return items.filter(item => status.published?.includes(item.value) || status.draft?.includes(item.value))
  }, [items, status])

  const missingItems = useMemo(() => {
    if (!status) return []
    return items.filter(item => !status.published?.includes(item.value) && !status.draft?.includes(item.value))
  }, [items, status])

  const activeItem = useMemo<LanguageSelectItem>(
    () =>
      items.find(item => {
        if (controlled) return item.value === value
        return item.value === locale
      })!,
    [controlled, items, locale, value],
  )

  const onValueChange = useCallback(
    (locale: Locale) => {
      if (!controlled) startTransition(() => setLocale(locale))
      onChange?.(locale)
    },
    [controlled, onChange, setLocale],
  )

  const onMissingLanguageClick = useCallback(
    (locale: Locale) => {
      addLanguage?.(locale)
      onValueChange(locale)
    },
    [addLanguage, onValueChange],
  )

  return (
    <Select onValueChange={onValueChange} value={controlled ? value : locale}>
      <SelectTrigger className={cn('gap-1', isPending && 'pointer-events-none opacity-75', className)} {...props}>
        <span className="relative">
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="size-4" />
            </div>
          )}
          <div
            className={cn('flex items-center gap-1.5', isPending && 'cursor-default opacity-30')}
            title={tCommon('switchLanguage')}
          >
            {activeItem.status && (
              <Tooltip>
                <TooltipTrigger asChild pointerEvents="auto">
                  {activeItem.badge}
                </TooltipTrigger>
                <TooltipContent arrow={false}>{activeItem.status}</TooltipContent>
              </Tooltip>
            )}
            <span>
              {activeItem?.label} {activeItem?.icon}
            </span>
          </div>
        </span>
      </SelectTrigger>
      <SelectContent align="end" position="popper" {...contentProps}>
        {status ? (
          <>
            {publishedAndDraftItems.map(item => (
              <SelectItem
                className={cn(item.value === activeItem?.value && 'pointer-events-none cursor-default bg-accent')}
                key={item.value}
                value={item.value}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="flex items-center gap-1">
                    {item.label} {item.icon}
                  </span>
                  <span className="flex items-center gap-1 [&_svg]:size-2">
                    {item.badge}
                    <span className="text-xs text-muted-foreground">{item.status}</span>
                  </span>
                </div>
              </SelectItem>
            ))}

            {missingItems.length > 0 && <SelectSeparator />}

            {missingItems.map(item => (
              <SelectItem
                className="flex justify-between gap-0.5"
                indicator={false}
                key={item.value}
                onSelect={e => {
                  e.preventDefault()
                  onMissingLanguageClick(item.value)
                }}
                value={item.value}
              >
                <span className="flex grow flex-col items-start">
                  <span className="flex items-center gap-1">
                    {item.label} {item.icon}
                  </span>
                  <span className="flex items-center gap-1 [&_svg]:size-2">
                    {item.badge}
                    <span className="text-xs text-muted-foreground">{item.status}</span>
                  </span>
                </span>
                <Tooltip>
                  <TooltipTrigger className="cursor-pointer">
                    <PlusIcon className="size-4 text-muted-foreground hover:text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent arrow={false}>{tCourses('addLanguage')}</TooltipContent>
                </Tooltip>
              </SelectItem>
            ))}
          </>
        ) : (
          items.map(item => (
            <SelectItem
              className={cn(item.value === activeItem?.value && 'pointer-events-none cursor-default bg-accent')}
              key={item.value}
              value={item.value}
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="flex items-center gap-1">
                  {item.label} {item.icon}
                </span>
                <span className="flex items-center gap-1 [&_svg]:size-2">
                  {item.badge}
                  <span className="text-xs text-muted-foreground">{item.status}</span>
                </span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
