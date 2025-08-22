'use client'

import { useCallback, useMemo } from 'react'

import { MessageCircleWarningIcon } from 'lucide-react'

import { AlertCallout } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCourse } from '@/hooks/use-course'
import { useLocale } from '@/hooks/use-locale'
import { useTranslations } from '@/hooks/use-translations'
import { type Course } from '@/lib/api/courses'

export const CourseInfo = () => {
  const { course, language, setCourse } = useCourse()
  const { localize } = useLocale()
  const t = useTranslations('Courses')

  const isSoftSkill = useMemo(() => course.type === 'skill', [course.type])

  const title = useMemo(() => localize(course.title, language) ?? '', [course.title, language, localize])

  const description = useMemo(
    () => localize(course.description, language) ?? '',
    [course.description, language, localize],
  )

  const handleLocalizedChange = useCallback(
    (field: keyof Course, value: string) => {
      setCourse(prev => ({
        ...prev,
        [field]: {
          ...((prev[field] as Record<string, string>) || {}),
          [language]: value,
        },
      }))
    },
    [setCourse, language],
  )

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t('infoSettings')}</h2>
          <p className="text-sm text-muted-foreground">{t('infoSettingsDescription')}</p>
        </div>

        {isSoftSkill && (
          <AlertCallout
            description={t('softSkillNotice')}
            icon={MessageCircleWarningIcon}
            title={t('softSkillNoticeTitle')}
            variant="warning"
          />
        )}

        <div className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="course-title">{t('courseTitle')}</Label>
            <Input
              id="course-title"
              onChange={e => handleLocalizedChange('title', e.target.value)}
              placeholder={t('courseTitlePlaceholder')}
              value={title}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course-description">{t('courseDescription')}</Label>
            <Textarea
              className="min-h-[120px]"
              id="course-description"
              onChange={e => handleLocalizedChange('description', e.target.value)}
              placeholder={t('courseDescriptionPlaceholder')}
              value={description}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
