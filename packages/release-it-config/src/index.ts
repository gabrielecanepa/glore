import { type Config as ConfigBase } from 'release-it'

export interface Context {
  branchName: string
  changelog: string
  latestVersion: string
  name: string
  releaseUrl: string
  repo: {
    remote: string
    protocol: string
    host: string
    owner: string
    repository: string
    project: string
  }
  version: string
}

export interface Config extends ConfigBase {
  github: ConfigBase['github'] & {
    releaseNotes?: (context: Context) => string
  }
}

export interface ReleaseItConfig {
  afterInit?: string | string[]
  afterBump?: string | string[]
  afterRelease?: string | string[]
  /** @default true */
  autoReleaseNotes?: boolean
  bumpFiles?: string[]
  /** @default true */
  changelog?: boolean
}

export default (config: ReleaseItConfig = {}): Config => {
  const { afterBump, afterInit, afterRelease, autoReleaseNotes = true, bumpFiles = [], changelog = true } = config

  return {
    git: {
      commitMessage: 'chore: release v${version}',
      push: true,
      pushArgs: ['--follow-tags', '--no-verify'],
      requireBranch: 'main',
      requireCleanWorkingDir: false,
      tagName: 'v${version}',
    },
    github: {
      autoGenerate: !autoReleaseNotes,
      release: true,
      releaseName: 'v${version}',
      releaseNotes: autoReleaseNotes
        ? context =>
            [
              ...context.changelog.split('\n').slice(1),
              `\n\n**Full Changelog:** [\`v${context.latestVersion}...v${context.version}\`](https://github.com/gabrielecanepa/glore/compare/v${context.latestVersion}...v${context.version})`,
            ].join('\n')
        : undefined,
      web: !autoReleaseNotes,
    },
    hooks: {
      'after:init': afterInit,
      'after:bump': afterBump,
      'after:release': afterRelease,
    },
    npm: {
      publish: false,
    },
    plugins: {
      '@release-it/bumper': {
        out: bumpFiles,
      },
      ...(changelog
        ? {
            '@release-it/conventional-changelog': {
              header: '# Changelog',
              infile: 'CHANGELOG.md',
              preset: {
                name: 'conventionalcommits',
                types: [
                  {
                    section: '🚀 Features',
                    type: 'feat',
                  },
                  {
                    section: '🔧 Fixes',
                    type: 'fix',
                  },
                  {
                    section: '🏗️ Build',
                    type: 'build',
                  },
                  {
                    section: '⚙️ CI',
                    type: 'ci',
                  },
                  {
                    section: '📑 Docs',
                    type: 'docs',
                  },
                  {
                    section: 'Other',
                    type: 'chore',
                  },
                  {
                    section: 'Other',
                    type: 'test',
                  },
                  {
                    section: 'Other',
                    type: 'style',
                  },
                  {
                    section: 'Other',
                    type: 'refactor',
                  },
                  {
                    section: 'Other',
                    type: 'perf',
                  },
                  {
                    section: 'Other',
                    type: 'revert',
                  },
                ],
              },
            },
          }
        : {}),
    },
  }
}
