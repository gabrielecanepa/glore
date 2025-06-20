'use client'

import { useMemo } from 'react'

import { motion, type MotionNodeAnimationOptions, type Variants } from 'framer-motion'

import { NotFoundGraphic } from '@/components/ui/graphics/not-found'
import { ServerErrorGraphic } from '@/components/ui/graphics/server-error'
import { Logo } from '@/components/ui/icons/logo'
import { Link } from '@/components/ui/link'
import { useDevice } from '@/hooks/use-device'
import { useTranslations } from '@/hooks/use-translations'
import { Route } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import metadata from 'static/metadata.json'

const variants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.25,
      duration: 0.5,
    },
  },
} satisfies MotionNodeAnimationOptions

export interface ErrorProps {
  error: { digest?: string } & Error
  reset: () => void
}

export interface ErrorViewProps {
  actions?: React.ReactNode
  hasHeader?: boolean
  message?: string
  title?: string
  type?: 'error' | 'not-found'
}

export const ErrorView = ({ actions, hasHeader, message, title, type = 'error' }: ErrorViewProps) => {
  const t = useTranslations()
  const { isMobile } = useDevice()

  const ErrorImage = useMemo(
    () =>
      type === 'not-found' ? (
        <NotFoundGraphic className="mb-8" width={isMobile ? 320 : 360} />
      ) : (
        <ServerErrorGraphic width={isMobile ? 200 : 220} />
      ),
    [isMobile, type],
  )
  const errorMessage = useMemo(
    () =>
      message ||
      (type === 'not-found'
        ? t('Common.notFoundMessage')
        : t.rich('Common.errorMessage', {
            contactUs: content => (
              <a className="text-primary underline" href={`mailto:${metadata.email}`}>
                {content}
              </a>
            ),
          })),
    [message, t, type],
  )
  const errorTitle = useMemo(
    () => title || (type === 'not-found' ? t('Common.notFound') : t('Common.errorTitle')),
    [t, title, type],
  )

  return (
    <>
      {hasHeader && (
        <header className="flex h-16 w-full items-center justify-center px-4">
          <Link href={Route.Home} title={t('Common.backToHome')}>
            <Logo className="mt-8 h-10" />
          </Link>
        </header>
      )}
      <motion.div
        animate="animate"
        className={cn(
          'flex flex-col items-center justify-start bg-background px-4 py-12 text-center',
          hasHeader ? 'min-h-[calc(100vh-4rem)]' : 'min-h-screen',
        )}
        initial="initial"
        variants={variants}
      >
        <div className="relative flex w-full grow flex-col items-center justify-center gap-6">
          {ErrorImage}
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">{errorTitle}</h2>
            <p className="mb-8 text-base text-foreground/75">{errorMessage}</p>
            <div className="flex justify-center gap-4">{actions}</div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
