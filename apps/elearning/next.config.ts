import bundleAnalyzer from '@next/bundle-analyzer'
import { type NextConfig } from 'next'

import nextIntl from 'next-intl/plugin'

import { Env } from '@/lib/env'
import config from 'config/app.json'

const I18N_MIDDLEWARE = './src/lib/i18n/middleware.ts'
const MESSAGE_DECLARATIONS = `./config/translations/${config.defaultLocale}.json`
const tsconfigPath = Env.DEV ? 'tsconfig.json' : 'tsconfig.build.json'

const nextConfig: NextConfig = {
  experimental: {
    typedEnv: Env.DEV,
    useCache: true,
  },
  images: {
    remotePatterns: [new URL(Env.SUPABASE_URL)],
    unoptimized: Env.DEV,
  },
  reactStrictMode: true,
  typescript: { tsconfigPath },
}

const generatePageMetadata = nextIntl({
  experimental: {
    createMessagesDeclaration: MESSAGE_DECLARATIONS,
  },
  requestConfig: I18N_MIDDLEWARE,
})

const withBundleAnalyzer = bundleAnalyzer({ enabled: Env.ANALYZE })

export default generatePageMetadata(withBundleAnalyzer(nextConfig))
