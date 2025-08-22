'use client'

import { useCallback, useMemo } from 'react'

import { InfoIcon } from 'lucide-react'
import { useFormatter } from 'use-intl'

import { UserCard } from '@/components/features/users/user-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCourse } from '@/hooks/use-course'
import { useTranslations } from '@/hooks/use-translations'
import { type Course } from '@/lib/api/courses'

export const CourseSettings = () => {
  const { course, initialCourse, setCourse } = useCourse()
  const t = useTranslations('Courses')
  const f = useFormatter()

  const isNew = useMemo(() => !course.id, [course.id])

  const disabledMessage = useMemo(() => {
    if (course.type === initialCourse.type && course.slug === initialCourse.slug) return t('noChangesDetected')
    if (!course.type && !course.slug) return t('fillSettingsFields')
    if (!course.languages?.some(language => course.title?.[language])) return t('noTitleProvided')
  }, [course, initialCourse, t])

  const isDisabled = useMemo(() => !!disabledMessage, [disabledMessage])

  const createdDate = useMemo(() => {
    if (!course.createdAt) return null
    return f.dateTime(new Date(course.createdAt), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [course.createdAt, f])

  const handleChange = useCallback(
    (field: keyof Course, value: string) => {
      setCourse(prev => ({ ...prev, [field]: value }))
    },
    [setCourse],
  )

  // const handleSave = useCallback(async () => {
  //   if (isDisabled) return

  //   const { slug, type } = course as Required<Course>

  //   if (isNew) {
  //     try {
  //       const created = await createCourse({ slug, type })
  //       setInitialCourse(created)
  //       toast.success(t('courseCreated'))
  //     } catch (error) {
  //       toast.error(t('courseCreationFailed'))
  //       return
  //     }
  //   }

  //   try {
  //     const updated = await updateCourse({ id: course.id!, type: course.type, slug: course.slug })
  //     setInitialCourse(updated)
  //     toast.success(t('courseUpdated'))
  //   } catch {}
  // }, [course, createCourse, isDisabled, isNew, t, updateCourse])

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t('settings')}</h2>
          <p className="text-sm text-foreground/75">{t('settingsDescription')}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>{t('courseType')}</Label>
            <Tabs onValueChange={value => handleChange('type', value)} value={course.type}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="intro">{t('courseTypeIntroductory')}</TabsTrigger>
                <TabsTrigger value="skill">{t('courseTypeSoftSkill')}</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-sm text-muted-foreground">
              {course.type === 'skill' ? t('courseTypeSoftSkillDescription') : t('courseTypeIntroductoryDescription')}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="course-slug">{t('courseSlug')}</Label>
            <Input
              id="course-slug"
              onChange={e => handleChange('slug', e.target.value)}
              placeholder={t('courseSlugPlaceholder')}
              value={course.slug}
            />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <InfoIcon className="size-3.5 shrink-0" />
              <span>{t('courseSlugDescription')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <Button className="w-fit text-foreground" disabled={isDisabled} disabledCursor variant="outline">
              {t('save')}
            </Button>
            {disabledMessage && <p className="text-xs text-muted-foreground">{disabledMessage}</p>}
          </div>
        </div>
      </div>

      {!isNew && (
        <>
          <Separator className="m-0" />

          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t('courseMetadata')}</h2>
              <p className="text-sm text-foreground/75">{t('courseMetadataDescription')}</p>
            </div>

            <div className="flex flex-col gap-4">
              {course.creator && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">{t('courseCreator')}</h3>
                  <UserCard hide={['city', 'country', 'languages']} user={course.creator} />
                </div>
              )}

              {course.createdAt && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">{t('createdOn')}</h3>
                  <p className="text-sm text-muted-foreground">{createdDate}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
