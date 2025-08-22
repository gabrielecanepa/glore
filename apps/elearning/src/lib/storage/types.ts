import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

import { type CourseListTab } from '@/components/features/courses/course-list'
import { type CourseTab } from '@/hooks/use-course'
import { type Course } from '@/lib/api/courses'
import { type User } from '@/lib/api/users/types'
import { type Locale } from '@/lib/i18n/types'
import { type Theme } from '@/lib/theme'

/**
 * Application cookies values.
 */
export interface Cookies {
  'course-language': Record<Course['slug'], Locale>
  'course-list-languages': Locale[]
  'course-list-tab': CourseListTab
  'course-view-tab': Record<Course['slug'], CourseTab>
  NEXT_LOCALE: Locale
  org: number
  'sidebar-open': boolean
  user: User
}

/**
 * Cookie name based on the `Cookies` interface.
 */
export type Cookie = keyof Cookies

/**
 * Cookie values based on the `Cookies` interface.
 */
export type CookieValue<T extends Cookie> = Cookies[T]

/**
 * Options for cookie names.
 */
export interface CookieKeyOptions {
  prefix?: string | boolean
  separator?: string
}

/**
 * Options for setting cookies.
 */
export interface CookieOptions extends Partial<ResponseCookie>, CookieKeyOptions {}

/**
 * Application local storage.
 */
export interface LocalStorage {
  theme: `${Theme}`
}

/**
 * Local storage keys used in the application.
 */
export type LocalStorageKey = keyof LocalStorage

/**
 * Local storage values based on the `LocalStorage` interface.
 */
export type LocalStorageValue<T extends LocalStorageKey> = LocalStorage[T]

/**
 * Public assets used across the application.
 */
export enum Public {
  Favicon = '/favicon.ico',
  Manifest = '/manifest.webmanifest',
}

/**
 * Remote assets relative to the base storage URL.
 */
export enum Asset {
  Logo = 'assets/logo.png',
  Trailer = 'assets/trailer.mp4',
  AppleIcon = 'metadata/apple-touch-icon.png',
  Favicon96 = 'metadata/favicon-96x96.png',
  OpenGraph = 'metadata/open-graph.png',
  WebAppIcon192 = 'metadata/web-app-icon-192x192.png',
  WebAppIcon512 = 'metadata/web-app-icon-512x512.png',
  WebAppScreenshotWide = 'metadata/web-app-screenshot-wide.png',
  WebAppScreenshotNarrow = 'metadata/web-app-screenshot-narrow.png',
}
