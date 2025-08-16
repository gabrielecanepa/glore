import { faker } from '@faker-js/faker'

import { pickRandom, randomRange } from '@repo/utils/random'

import { client } from './config/client'
import { countries, languages, user } from './config/data'
import { randomUserDetails, verifyResponse } from './config/utils'

const { avatar, domain } = user

export const seedUsers = async (roles = user.roles) =>
  await Promise.all(
    roles.map(async (role, i) => {
      faker.seed(i)

      const country = pickRandom(countries)
      const userLanguages = [...new Set([...country.languages, ...randomRange(languages, 0, 3)])]
      const { gender, pronouns, sex } = randomUserDetails()
      const name = faker.person.firstName(gender)
      const phone = pickRandom([`${country.prefix}${Math.floor(1000000000 + Math.random() * 9000000000)}`, undefined])

      const authResponse = await client.auth.admin.createUser({
        email: `${role}@${domain}`,
        password: 'password',
        email_confirm: true,
        phone_confirm: true,
        role: 'authenticated',
        phone,
        user_metadata: {
          first_name: name,
          last_name: faker.person.lastName(gender),
          is_admin: role === 'admin',
          is_editor: role === 'editor',
        },
      })
      verifyResponse(authResponse, 'users')
      const authUser = authResponse.data.user!

      const avatarParams = new URLSearchParams()
      avatarParams.set('seed', name)

      for (const [key, value] of Object.entries(avatar.params)) {
        const param = Array.isArray(value) ? value.join(',') : String(value)
        avatarParams.set(key, param)
      }

      const publicResponse = await client
        .from('users')
        .update({
          sex,
          pronouns,
          languages: userLanguages,
          birthday: faker.date.between({ from: '1970-01-01', to: '2000-12-31' }).toISOString(),
          avatar_url: `${avatar.url}/${avatar.style}/png?${avatarParams.toString()}`,
          country: country.code,
          city: faker.location.city(),
          bio: faker.lorem.paragraph(),
        })
        .eq('id', authUser.id)
        .select()
      verifyResponse(publicResponse, 'users')

      return authUser
    }),
  )
