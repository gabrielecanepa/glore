import { type Metadata, type ResolvingMetadata } from 'next'

import { asset, Asset } from '@/lib/storage'
import { getLocale, getTranslations, type MessageKey } from '@/services/i18n'
import app from 'config/app.json'
import i18n from 'config/i18n.json'

const metadataBase: Metadata = {
  title: app.title,
  applicationName: app.title,
  category: app.category,
  creator: app.author.name,
  authors: app.author,
  manifest: Asset.Manifest,
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  openGraph: {
    alternateLocale: i18n.defaultLocale,
    countryName: app.country,
    emails: app.email,
    images: app.image,
    phoneNumbers: app.phone,
    siteName: app.title,
    title: app.title,
    ttl: 60,
    url: app.url,
  },
  icons: [
    {
      sizes: '96x96',
      type: 'image/png',
      url: asset('favicon-96x96.png'),
    },
    {
      type: 'image/svg+xml',
      url: Asset.Logo,
    },
    {
      rel: 'shortcut icon',
      url: Asset.Favicon,
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: asset('apple-touch-icon.png'),
    },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: app.title,
  },
}

export interface MetadataProps {
  description?: string
  image?: string
  separator?: string
  title?: string
}

export interface MetadataFnProps {
  description?: MessageKey
  image?: string
  separator?: string
  title?: MessageKey
}

export const metadata = async (props?: MetadataProps) => {
  const { description, image, separator = ' - ', title } = props ?? {}

  const locale = await getLocale()
  const pageTitle = title ? `${title} ${separator} ${metadataBase.title as string}` : metadataBase.title

  return {
    ...metadataBase,
    title: pageTitle,
    ...(description ? { description } : {}),
    openGraph: {
      ...metadataBase.openGraph,
      ...(description ? { description } : {}),
      ...(image ? { images: image } : {}),
      locale: locale ?? metadataBase.openGraph?.locale,
    },
  } as Metadata
}

export const metadataFn =
  ({ description, image, separator = ' - ', title }: MetadataFnProps) =>
  async (_: object, parent: ResolvingMetadata): Promise<Metadata> => {
    const t = await getTranslations()
    const locale = await getLocale()
    const previous = await parent

    const pageTitle = title ? `${t(title)} ${separator} ${metadataBase.title as string}` : metadataBase.title

    return {
      ...metadataBase,
      ...previous,
      title: pageTitle,
      ...(description ? { description: t(description) } : {}),
      openGraph: {
        ...metadataBase.openGraph,
        ...(description ? { description: t(description) } : {}),
        ...(image ? { images: image } : {}),
        locale: locale ?? metadataBase.openGraph?.locale,
      },
    } as Metadata
  }
