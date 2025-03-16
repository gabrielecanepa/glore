import { type AnyObject } from '@repo/utils'
import { getRequestConfig } from 'next-intl/server'

import { getLocale } from '@/services/i18n'

export default getRequestConfig(async () => {
  const locale = await getLocale()

  const messages = (
    (await import(`config/translations/${locale}.json`)) as {
      default: AnyObject
    }
  ).default

  return { locale, messages }
})
