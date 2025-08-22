import { type Metadata, type ResolvingMetadata } from 'next'

import { type Locale } from 'use-intl'

import { type AnyRecord } from '@repo/utils/types'

import { LOCALES } from '@/lib/i18n/config'
import { getLocale, getTranslations } from '@/lib/i18n/server'
import { type MessageKey } from '@/lib/i18n/types'
import { type PageProps, type Route } from '@/lib/navigation'
import { Asset, Public } from '@/lib/storage/types'
import { asset } from '@/lib/storage/utils'
import metadata from 'config/metadata.json'

export interface MetadataOptions<T extends boolean> {
  description?: T extends true ? MessageKey : string
  image?: string
  parent?: Metadata
  separator?: string
  title?: T extends true ? MessageKey : string
  translate?: T
}

export interface MetadataParams<T extends AnyRecord> {
  params: Promise<T>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const alternateLanguages = LOCALES.reduce(
  (languages, locale) => ({ ...languages, [locale]: `${metadata.url}?lang=${locale}` }),
  {} as Record<Locale, string>,
)

const DEFAULT_METADATA: Metadata = {
  applicationName: metadata.name,
  category: metadata.category,
  authors: metadata.authors,
  creator: metadata.authors[0].name,
  keywords: metadata.keywords,
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  alternates: {
    canonical: metadata.url,
    languages: alternateLanguages,
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    emails: metadata.email,
    images: [asset(Asset.OpenGraph)],
    phoneNumbers: metadata.phone,
    siteName: metadata.name,
    ttl: 60,
  },
  icons: [
    {
      sizes: '96x96',
      type: 'image/png',
      url: asset(Asset.Favicon96),
    },
    {
      rel: 'shortcut icon',
      url: Public.Favicon,
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: asset(Asset.AppleIcon),
    },
  ],
  appleWebApp: {
    capable: true,
    title: metadata.name,
    statusBarStyle: 'black-translucent',
    startupImage: asset(Asset.WebAppScreenshotNarrow),
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

/**
 * Localizes and merges the provided values with the default metadata and
 * returns a function that generates metadata for a page.
 */
export const createMetadata =
  <R extends Route, K extends AnyRecord = AnyRecord, T extends boolean = true>(options: MetadataOptions<T> = {}) =>
  async (_: PageProps<R, K>, parent: ResolvingMetadata) =>
    intlMetadata<T>({ ...options, parent: (await parent) as Metadata })

/**
 * Localizes the provided values and returns a complete metadata object.
 * Localization is skipped when the `static` flag is set to true.
 */
export const intlMetadata = async <T extends boolean = true>(options: MetadataOptions<T> = {}) => {
  const {
    description: userDescription,
    image,
    parent = {},
    separator = metadata.titleSeparator,
    title: userTitle,
    translate = true as T,
  } = options

  const t = await getTranslations()
  const locale = await getLocale()
  const alternateLocale = LOCALES[LOCALES.indexOf(locale) + 1] ?? LOCALES[0]

  const title = userTitle
    ? `${translate ? t.flat(userTitle) : userTitle} ${separator} ${metadata.title}`
    : metadata.title
  const description = userDescription
    ? translate
      ? t.flat(userDescription)
      : userDescription
    : metadata.description[locale]

  return {
    ...DEFAULT_METADATA,
    ...parent,
    title,
    description,
    openGraph: {
      ...DEFAULT_METADATA.openGraph,
      ...(parent.openGraph ?? {}),
      title,
      description,
      ...(image ? { images: image } : {}),
      locale,
      alternateLocale,
    },
  }
}
