'use client'

import { useTranslations } from 'next-intl'

import { ErrorView } from '@/components/layout/error-view'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Route } from '@/lib/navigation'

export default () => {
  const t = useTranslations('Certificates')

  return (
    <ErrorView
      Actions={
        <Button asChild color="secondary" size="lg" variant="outline">
          <Link href={Route.Certificates}>{t('backTo')}</Link>
        </Button>
      }
      message={t('notFoundMessage')}
      title={t('notFound')}
      type="not-found"
    />
  )
}
