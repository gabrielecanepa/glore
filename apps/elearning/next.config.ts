import { relative } from 'node:path'

import bundleAnalyzer from '@next/bundle-analyzer'
import { type NextConfig } from 'next'

import { type AnyObject } from '@repo/utils'
import loaderUtils from 'loader-utils'
import { next } from 'million/compiler'
import nextIntl from 'next-intl/plugin'
import { type Configuration, type LoaderContext, type ModuleOptions, type RuleSetRule } from 'webpack'

import { Env } from '@/lib/env'

type BundleAnalyzerConfig = Parameters<typeof bundleAnalyzer>[0]
type MillionConfig = Parameters<typeof next>[1]
type NextConfigMillion = Parameters<typeof next>[0]
type WebpackConfig = Omit<Configuration, 'module'> & {
  module?: Omit<ModuleOptions, 'rules'> & {
    rules?: WebpackRule[]
  }
}
type WebpackGetIdent = (context: LoaderContext<AnyObject>, identName: string, name: string) => string
type WebpackRule = Omit<RuleSetRule, 'oneOf' | 'use'> & {
  oneOf?: WebpackRule[]
  use?: {
    ident: string
    loader: string
    options?: {
      modules?: {
        getLocalIdent?: WebpackGetIdent
      }
    }
  }[]
}

const I18N_PATH = './src/middlewares/locale.ts'
const tsconfigPath = Env.isProduction ? 'tsconfig.build.json' : 'tsconfig.json'

const hashOnlyIdent: WebpackGetIdent = (context, _, exportName) =>
  loaderUtils
    .getHashDigest(
      Buffer.from(`filePath:${relative(context.rootContext, context.resourcePath).replace(/\\+/g, '/')}#className:${exportName}`),
      'md4',
      'base64',
      6,
    )
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/^(-?\d|--)/, '_$1')

const nextConfig: NextConfig = {
  experimental: {
    serverMinification: true,
  },
  reactStrictMode: true,
  typescript: {
    tsconfigPath,
  },
  webpack: (config: WebpackConfig, { dev }) => {
    const webpackConfig: WebpackConfig = {
      ...config,
      watchOptions: {
        aggregateTimeout: 500,
        poll: 1000,
      },
    }

    if (dev) return webpackConfig

    const rules = webpackConfig.module?.rules
      ?.find(rule => typeof rule?.oneOf === 'object')
      ?.oneOf?.filter(rule => rule && Array.isArray(rule?.use))
    if (!rules?.length) return webpackConfig

    for (const rule of rules) {
      if (!rule?.use) continue

      for (const moduleLoader of rule.use) {
        if (moduleLoader.loader.includes('css-loader') && !moduleLoader.loader.includes('postcss-loader')) {
          moduleLoader.options = {
            ...(moduleLoader.options ?? {}),
            modules: {
              ...(moduleLoader.options?.modules ?? {}),
              getLocalIdent: hashOnlyIdent,
            },
          }
        }
      }
    }
    return webpackConfig
  },
}

const bundleAnalyzerConfig: BundleAnalyzerConfig = {
  enabled: Env.isAnalyze,
}

const millionConfig: MillionConfig = {
  auto: true,
  log: false,
  rsc: true,
  telemetry: false,
}

const withBundleAnalyzer = bundleAnalyzer(bundleAnalyzerConfig)(nextConfig)
const withNextIntl = nextIntl(I18N_PATH)(withBundleAnalyzer)

export default next(withNextIntl as NextConfigMillion, millionConfig)
