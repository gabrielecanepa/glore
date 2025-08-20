'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { InfoIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { handleize } from '@repo/utils/handleize'

import { UserCard } from '@/components/features/users/user-card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useLocale } from '@/hooks/use-locale'
import { useTranslations } from '@/hooks/use-translations'
import { type Course } from '@/lib/api/courses/types'
import { type Locale } from '@/lib/i18n/types'
import { type Enums } from 'supabase/types'

export interface CourseInfoData {
  type: Enums<'course_type'>
  title: string
  slug: string
  description: string
}

export interface CourseInfoProps {
  course: Partial<Course>
  language: Locale
  onChange?: (data: CourseInfoData) => void
}

/**
 * Course information form component.
 * Allows editing course type, title, slug, and description.
 */
export const CourseInfo = ({ course, language, onChange }: CourseInfoProps) => {
  const { localize } = useLocale()
  const t = useTranslations('Courses')

  const isExisting = useMemo(() => !!course.id, [course.id])
  const isSoftSkill = useMemo(() => course.type === 'skill', [course.type])

  const form = useForm<CourseInfoData>({
    defaultValues: {
      type: course.type || 'skill',
      title: localize(course.title, language) || '',
      slug: course.slug || '',
      description: localize(course.description, language) || '',
    },
  })

  const [manualSlug, setManualSlug] = useState(false)

  const watchedValues = form.watch()
  const { slug, title, type } = watchedValues

  // Auto-generate slug from title if not manually edited
  useEffect(() => {
    if (!manualSlug && title) {
      const generatedSlug = handleize(title)
      if (generatedSlug !== slug) {
        form.setValue('slug', generatedSlug)
      }
    }
  }, [title, slug, manualSlug, form])

  const handleSlugChange = useCallback(
    (value: string) => {
      setManualSlug(true)
      form.setValue('slug', handleize(value))
    },
    [form],
  )

  const handleTypeChange = useCallback(
    (checked: boolean) => {
      form.setValue('type', checked ? 'skill' : 'intro')
    },
    [form],
  )

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(watchedValues)
    }
  }, [watchedValues, onChange])

  return (
    <div className="space-y-6">
      <Form {...form}>
        <div className="space-y-6">
          {/* Course Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('courseType')}</FormLabel>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Switch checked={field.value === 'skill'} onCheckedChange={handleTypeChange} />
                    <Label className="text-sm font-normal">
                      {type === 'skill' ? t('courseTypeSoftSkill') : t('courseTypeIntroductory')}
                    </Label>
                  </div>
                </div>
                <FormDescription>
                  {type === 'skill' ? t('courseTypeSoftSkillDescription') : t('courseTypeIntroductoryDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Course Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('courseTitle')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('courseTitlePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Course Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('courseSlug')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('courseSlugPlaceholder')}
                    {...field}
                    onChange={e => handleSlugChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription className="flex items-start space-x-2">
                  <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>{t('courseSlugDescription')}</span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Course Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('courseDescription')}</FormLabel>
                <FormControl>
                  <Textarea className="min-h-[120px]" placeholder={t('courseDescriptionPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Soft Skill Notice */}
          {isSoftSkill && (
            <div className="flex space-x-2 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
              <InfoIcon className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-800 dark:text-blue-200">{t('softSkillNotice')}</p>
            </div>
          )}
        </div>
      </Form>

      {/* Creator Section */}
      {isExisting && course.creator && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">{t('courseCreator')}</h3>
            <UserCard user={course.creator} />
          </div>
        </>
      )}
    </div>
  )
}
