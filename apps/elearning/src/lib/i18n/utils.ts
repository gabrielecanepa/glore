import { type Locale } from 'use-intl'

import { LOCALES } from '@/lib/i18n/config'
import { type IntlRecord } from '@/lib/i18n/types'

/**
 * Localizes a JSON object based on the provided locale.
 */
export const localize = (record: IntlRecord, locale: Locale, fallback?: Locale) => {
  const keys = Object.keys(record)
  if (keys.includes(locale)) return record[locale]
  return fallback ? record[fallback] : undefined
}

/**
 * Formats a date according to the provided locale.
 */
export const localizeDate = (
  input: Date | string | number,
  type: 'short' | 'long' = 'long',
  locale: Locale,
): string => {
  const date = typeof input === 'object' ? input : new Date(input)
  if (type === 'short') return new Intl.DateTimeFormat(locale).format(date)
  return new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Record with locale keys and empty string values.
 */
export const emptyLocaleRecord = LOCALES.reduce((acc, locale) => {
  acc[locale] = ''
  return acc
}, {} as IntlRecord)
