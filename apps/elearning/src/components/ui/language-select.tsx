'use client'

import { useCallback, useMemo, useTransition } from 'react'

import { LoaderIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Select, SelectContent, SelectItem, SelectTrigger, type SelectTriggerProps } from '@/components/ui/select'
import { useLocale } from '@/hooks/use-locale'
import { cn } from '@/lib/utils'
import { type Locale } from '@/services/i18n'
import app from 'config/app.json'

const items = Object.entries(app.locales).map(([value, { flag, name }]) => ({
  label: name,
  value,
  icon: flag,
}))

export const LanguageSelect = (props: SelectTriggerProps) => {
  const [locale, setLocale] = useLocale()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('Common')

  const activeItem = useMemo(() => items.find(item => item.value === locale), [locale])

  const onChange = useCallback(
    (locale: Locale) => {
      startTransition(async () => {
        await setLocale(locale)
      })
    },
    [setLocale],
  )

  return (
    <Select defaultValue={locale} onValueChange={onChange}>
      <SelectTrigger className={cn('hover:bg-accent', isPending && 'pointer-events-none')} title={t('selectLanguage')} {...props}>
        <span className="relative">
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoaderIcon className="size-4 animate-spin" />
            </div>
          )}
          <span className={cn(isPending && 'cursor-default opacity-30')}>
            {activeItem?.label} {activeItem?.icon}
          </span>
        </span>
      </SelectTrigger>
      <SelectContent align="end" position="popper">
        {items.map(item => (
          <SelectItem
            className={cn(item.value === activeItem?.value && 'pointer-events-none cursor-default bg-accent')}
            key={item.value}
            value={item.value}
          >
            <span>
              {item.label} {item?.icon}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
