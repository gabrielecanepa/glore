import './globals.css'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { I18nProvider } from '@/components/providers/i18n-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ProgressBarProvider } from '@/components/ui/progress-bar'
import { Toaster } from '@/components/ui/toaster'
import { generateAppMetadata } from '@/lib/metadata'
import { getLocale, getTranslations } from '@/services/i18n'
import metadata from 'config/metadata.json'

export default async ({ children }: React.PropsWithChildren) => {
  const locale = await getLocale()
  const t = await getTranslations()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Page',
    name: metadata.name,
    description: t('App.description'),
    image: metadata.image,
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <I18nProvider>
          <ThemeProvider>
            <ProgressBarProvider>
              {children}
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </ProgressBarProvider>
          </ThemeProvider>
        </I18nProvider>
        <script dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} type="application/ld+json" />
      </body>
    </html>
  )
}

export const generateMetadata = generateAppMetadata({
  description: 'App.description',
})
