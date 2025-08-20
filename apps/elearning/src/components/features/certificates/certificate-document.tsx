'use client'

import { useMemo } from 'react'

import { Award, Building, CalendarIcon, Clock, PrinterIcon, ShareIcon, UserIcon, ViewIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Image } from '@/components/ui/image'
import { Separator } from '@/components/ui/separator'
import { useLocale } from '@/hooks/use-locale'
import { useSession } from '@/hooks/use-session'
import { useTranslations } from '@/hooks/use-translations'
import { type Certificate } from '@/lib/api/certificates/types'

export const CertificateDocument = ({ certificate }: { certificate: Certificate }) => {
  const { user } = useSession()
  const { localize, localizeDate } = useLocale()
  const t = useTranslations()

  const isIssued = useMemo(() => !!certificate.issuedAt, [certificate])

  // const renderStarRating = useCallback(
  //   (rating: number) => (
  //     <div className="flex items-center">
  //       {[1, 2, 3, 4, 5].map(i => (
  //         <StarIcon
  //           className={cn('size-5', i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')}
  //           key={i}
  //         />
  //       ))}
  //     </div>
  //   ),
  //   [],
  // )

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">
              {t('Certificates.title')} {localize(certificate.organization.description)}
            </CardTitle>
            {certificate.issuedAt && (
              <CardDescription>
                {t('Certificates.issuedOn')} {localizeDate(certificate.issuedAt)}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isIssued ? (
              <>
                <Badge className="text-sm" variant="outline">
                  {t('Common.verified')}
                </Badge>
                <Badge className="bg-green-600 hover:bg-green-700">{t('Common.completed')}</Badge>
              </>
            ) : (
              <Badge className="text-sm" variant="outline">
                {t('Common.underReview')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Organization and Reviewer */}
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p>{t('Certificates.certificateMessagePre')}</p>
          <h3 className="text-xl font-bold">
            {user.firstName} {user.lastName}
          </h3>
          <p>
            {t('Certificates.certificateMessagePost', {
              org: certificate.organization.name,
            })}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 pb-4 md:grid-cols-2">
          <div className="flex items-start space-x-3">
            {certificate.organization.avatarUrl ? (
              <Image src={certificate.organization.avatarUrl} width={20} />
            ) : (
              <Building className="mt-0.5 size-5 text-muted-foreground" />
            )}
            <div>
              <h3 className="font-medium">{t('Common.organization')}</h3>
              <p>{certificate.organization.name}</p>
            </div>
          </div>
          {certificate.reviewer && (
            <div className="flex items-start space-x-3">
              <UserIcon className="mt-0.5 size-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">{t('Certificates.reviewedBy')}</h3>
                <p>
                  {certificate.reviewer?.firstName} {certificate.reviewer?.lastName}
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Dates and Duration */}
        <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-3">
          <div className="flex items-start space-x-3">
            <CalendarIcon className="mt-0.5 size-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">{t('Common.startDate')}</h3>
              <p>{localizeDate(certificate.activityStartDate, 'short')}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CalendarIcon className="mt-0.5 size-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">{t('Common.endDate')}</h3>
              <p>{localizeDate(certificate.activityEndDate, 'short')}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="mt-0.5 size-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">{t('Common.duration')}</h3>
              <p>
                {certificate.activityDuration} {t('Common.hours').toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div className="py-4">
          <h3 className="mb-2 font-medium">{t('Certificates.certificateDescription')}</h3>
          <p className="whitespace-pre-line text-muted-foreground">{certificate.activityDescription}</p>
        </div>

        <Separator />

        {/* Skills */}
        <div className="py-4">
          <h3 className="mb-3 font-medium">{t('Common.skills')}</h3>
          <div className="flex flex-wrap gap-2">
            {certificate.skills.map(skill => (
              <Badge className="px-3 py-1" key={skill.id}>
                <Award className="mr-1 size-3.5" />
                {localize(skill.title)}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end pt-2">
        <Button>
          {t('Common.preview')}
          <ViewIcon className="ml-2 size-4" />
        </Button>
        <Button>
          {t('Common.share')}
          <ShareIcon className="ml-2 size-4" />
        </Button>
        <Button onClick={() => window.print()}>
          {t('Certificates.download')}
          <PrinterIcon className="ml-2 size-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
