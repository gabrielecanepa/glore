import { type User } from '@supabase/supabase-js'

import { handleize } from '@repo/utils/handleize'
import { pick } from '@repo/utils/pick'
import { pickRandom } from '@repo/utils/random'

import { type Tables } from 'supabase/types'

import { client } from './config/client'
import { skill } from './config/data'
import { pickLocales, randomLocales, verifyResponse } from './config/utils'

const CREATOR_ROLES = ['admin', 'editor']

export const seedSkills = async ({ users }: { users?: User[] }) => {
  const skills: Tables<'skills'>[] = []

  const groups = await client.from('skill_groups').insert(pick(skill.groups, 'name')).select()
  verifyResponse(groups, 'skill_groups')

  for (const skillGroup of skill.groups) {
    // @ts-expect-error coherce json type
    const group = groups.data!.find(({ name }) => name.en === skillGroup.name.en)!

    for (const course of skillGroup.courses) {
      const slug = handleize(course.title.en)
      const creator = users
        ? pickRandom(users.filter(user => CREATOR_ROLES.includes(user.email!.split('@')[0])))
        : undefined
      const publishedLocales = randomLocales()
      const draftLocales = randomLocales().filter(locale => !publishedLocales.includes(locale))
      const courseLocales = [...new Set([...publishedLocales, ...draftLocales])]

      const title = pickLocales(course.title, courseLocales)
      const description = pickLocales(course.description, courseLocales)

      const skill = await client
        .from('skills')
        .insert({
          name: title,
          description,
          skill_group_id: group.id,
        })
        .select()
      verifyResponse(skill, 'skills')

      const skillCourse = await client
        .from('courses')
        .insert({
          slug,
          title,
          description,
          icon: course.icon,
          published_locales: publishedLocales,
          draft_locales: draftLocales,
          sort_order: skills.length + 1,
          skill_id: skill.data![0].id,
          creator_id: creator?.id,
        })
        .select()
      verifyResponse(skillCourse, 'courses')

      skills.push(...skill.data!)
    }
  }

  return skills
}
