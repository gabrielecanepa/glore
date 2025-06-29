import { resolve } from 'node:path'

import bundleAnalyzer from '@next/bundle-analyzer'
import { type NextConfig } from 'next'

import createNextIntlPlugin from 'next-intl/plugin'

import { Env } from '@/lib/env'
import config from 'config/app.json'

const I18N_MIDDLEWARE = './src/lib/i18n/middleware.ts'
const MESSAGE_DECLARATIONS = resolve(`./config/translations/${config.defaultLocale}.json`)
const tsconfigPath = Env.DEV ? './tsconfig.json' : './tsconfig.build.json'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL(Env.SUPABASE_URL)],
  },
  reactStrictMode: true,
  typescript: { tsconfigPath },
}

const nextIntlPlugin = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: MESSAGE_DECLARATIONS,
  },
  requestConfig: I18N_MIDDLEWARE,
})

export default nextIntlPlugin(bundleAnalyzer({ enabled: Env.ANALYZE })(nextConfig))
