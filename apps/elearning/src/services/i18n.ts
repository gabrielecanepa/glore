'use server'

import { cookies } from 'next/headers'

import { getMessages, getTranslations } from 'next-intl/server'
import config, { type locales } from 'static/i18n.json'
import type en from 'static/translations/en.json'

import { Cookie } from '@/lib/storage'

declare global {
  type IntlMessages = typeof en
}

export type Locale = keyof typeof locales

export const getLocale = async () => {
  const store = await cookies()
  return (store.get(Cookie.Locale)?.value || config.defaultLocale) as Locale
}

export const setLocale = async (locale: Locale) => {
  const cookieStore = await cookies()
  cookieStore.set(Cookie.Locale, locale)
}

export { getMessages, getTranslations }
