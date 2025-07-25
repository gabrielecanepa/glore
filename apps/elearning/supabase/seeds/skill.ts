import { type SeedClient } from '@snaplet/seed'
import { type User } from '@supabase/supabase-js'

import { handleize, randomItem, randomRange } from '@repo/utils'

import { LOCALES } from '@/lib/i18n/utils'
import { dynamicSeeds, placeholderImageUrl } from 'supabase/.snaplet/data.json'
import { type Enums } from 'supabase/types'

const randomLocales = () => randomRange(LOCALES)

export const seedSkills = async (seed: SeedClient, skillAreas = dynamicSeeds.skill_areas, users: User[]) =>
  await seed.skill_areas(
    skillAreas.map(({ skills, ...area }, i) => ({
      ...area,
      skills: skills.map(({ course, ...skill }, j) => {
        const publishedLocales = randomLocales()
        const draftLocales = randomLocales().filter(locale => !publishedLocales.includes(locale))

        return {
          ...skill,
          courses: [
            {
              ...course,
              creator_id: randomItem(users).id ?? null,
              slug: handleize(skill.name.en),
              title: skill.name,
              description: skill.description,
              type: 'assessment',
              image_url: `${placeholderImageUrl}?random=${j}`,
              published_locales: publishedLocales,
              draft_locales: draftLocales,
              lessons: course.lessons.map(({ assessments, evaluations, type, ...lesson }, k) => ({
                ...lesson,
                assessments: assessments?.map(assessment => ({
                  ...assessment,
                  deleted_at: null,
                })),
                evaluations: evaluations?.map(evaluation => ({
                  ...evaluation,
                  deleted_at: null,
                })),
                type: type as Enums<'lesson_type'>,
                sort_order: k + 1,
                deleted_at: null,
              })),
              sort_order: i * skillAreas[0].skills.length + j + 1,
              archived_at: null,
              deleted_at: null,
            },
          ],
          deleted_at: null,
        }
      }),
      deleted_at: null,
    })),
  )
