'use client'

import { useMemo } from 'react'

import { NotFoundGraphic } from '@/components/ui/graphics/not-found'
import { ServerErrorGraphic } from '@/components/ui/graphics/server-error'
import { useDevice } from '@/hooks/use-device'
import { useTranslations } from '@/hooks/use-translations'
import { cn } from '@/lib/utils'
import metadata from 'config/metadata.json'

export interface ErrorProps {
  error: { digest?: string } & Error
  reset: () => void
}

export interface ErrorViewProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode
  message?: string
  type?: 'error' | 'not-found'
}

export const ErrorView = ({
  children,
  className,
  header,
  message,
  title,
  type = 'error',
  ...props
}: ErrorViewProps) => {
  const t = useTranslations()
  const { isMobile } = useDevice()

  const ErrorImage = useMemo(
    () =>
      type === 'not-found' ? (
        <NotFoundGraphic className="mb-8" width={isMobile ? 320 : 360} />
      ) : (
        <ServerErrorGraphic width={isMobile ? 160 : 180} />
      ),
    [isMobile, type],
  )

  const errorTitle = useMemo(
    () => title || (type === 'not-found' ? t('Common.notFound') : t('Common.errorTitle')),
    [t, title, type],
  )

  const errorMessage = useMemo(
    () =>
      message ||
      (type === 'not-found'
        ? t('Common.notFoundMessage')
        : t.rich('Common.errorMessage', {
            contactUs: content => (
              <a className="text-brand underline" href={`mailto:${metadata.email}`}>
                {content}
              </a>
            ),
          })),
    [message, t, type],
  )

  return (
    <>
      {header}
      <div
        className={cn(
          'flex h-full flex-col items-center justify-start bg-background px-4 py-12 text-center',
          className,
        )}
        {...props}
      >
        <div className="relative flex w-full grow flex-col items-center justify-center gap-6">
          {ErrorImage}
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">{errorTitle}</h2>
            <p className="mb-8 text-base text-foreground/75">{errorMessage}</p>
            <div className="flex justify-center gap-4">{children}</div>
          </div>
        </div>
      </div>
    </>
  )
}
