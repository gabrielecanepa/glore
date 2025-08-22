'use client'

import { useCallback, useContext, useMemo } from 'react'

import { I18nContext } from '@/components/providers/i18n-provider'
import { useTranslations } from '@/hooks/use-translations'
import { LOCALE_ITEMS, LOCALES, TITLE_CASE_LOCALES } from '@/lib/i18n/config'
import { type IntlRecord, type Locale, type LocaleItem } from '@/lib/i18n/types'
import * as utils from '@/lib/i18n/utils'

/**
 * Extends the hook from `use-intl` to support localization of JSON values.
 */
export const useLocale = () => {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useLocale must be used within a I18nProvider')

  const t = useTranslations('Languages')

  const localeItems = useMemo<LocaleItem[]>(
    () =>
      LOCALE_ITEMS.map(item => {
        const label = t(item.value)
        const displayLabel = TITLE_CASE_LOCALES.includes(context.locale) ? label : label.toLowerCase()

        return {
          ...item,
          label,
          displayLabel,
        }
      }),
    [context.locale, t],
  )

  const localize = useCallback(
    (record?: IntlRecord, locale: Locale = context.locale) => {
      if (!record) return record
      return utils.localize(record, locale)
    },
    [context.locale],
  )

  const localizeDate = useCallback(
    (input?: Date | string | number, type: 'short' | 'long' = 'long', locale: Locale = context.locale) => {
      if (!input) return input
      return utils.localizeDate(input, type, locale)
    },
    [context.locale],
  )

  const isTitleCase = useCallback(
    (locale: Locale = context.locale) => TITLE_CASE_LOCALES.includes(locale),
    [context.locale],
  )

  return {
    /**
     * Current application locale.
     */
    locale: context.locale,
    /**
     * Available application locales.
     */
    locales: LOCALES,
    /**
     * Locale items used across the application.
     */
    localeItems,
    /**
     * Sets the application locale.
     */
    setLocale: context.setLocale,
    /**
     * Localizes a JSON object based on the provided or current locale.
     */
    localize,
    /**
     * Formats a date according to the provided or current locale.
     */
    localizeDate,
    /**
     * Checks if the provided or current locale should be displayed in title case.
     */
    isTitleCase,
  }
}
