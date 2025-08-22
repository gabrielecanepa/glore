import { type createTranslator, type NamespaceKeys, type NestedKeyOf } from 'use-intl'

import { type AnyRecord } from '@repo/utils/types'

import { type locales } from 'config/app.json'
import type messages from 'config/translations/en.json'

import { type FORMATS } from './config'

export type Locale = keyof typeof locales
type Messages = typeof messages
type Formats = typeof FORMATS

declare module 'use-intl' {
  interface AppConfig {
    Formats: Formats
    Locale: Locale
    Messages: Messages
  }
}

/**
 * Intl translator function type.
 */
export type IntlTranslator<NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never> = ReturnType<
  typeof createTranslator<Messages, NestedKey>
>

/**
 * Extends the `IntlTranslator` type to include a `flat` function.
 */
export interface Translator<NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never>
  extends IntlTranslator<NestedKey> {
  /**
   * Flat translation function that allows passing any string as a key.
   *
   * **⚠️ Use with caution!** This method bypasses type safety and should be called only when using known dynamic keys.
   */
  flat: (key: string) => string
  raw(key: Parameters<IntlTranslator<NestedKey>['raw']>[0]): string
}

/**
 * Key of the application static messages.
 */
export type MessageKey = Exclude<NestedKeyOf<Messages>, keyof Messages>

/**
 * Locale item used in the application.
 */
export interface LocaleItem {
  displayLabel: string
  icon: string
  label: string
  value: Locale
}

/**
 * Record with translations for different locales.
 */
export type IntlRecord = Partial<Record<Locale, string>>

/**
 * Record with localized values.
 */
export type Localized<T extends AnyRecord> = {
  [K in keyof T]: T[K] extends IntlRecord | undefined
    ? T[K] extends undefined
      ? undefined
      : string | undefined
    : T[K] extends IntlRecord
      ? string | undefined
      : T[K]
}
