import type { Config } from 'release-it'

export default {
  git: {
    commitMessage: 'chore: release v${version}',
    push: true,
    pushArgs: ['--follow-tags', '--no-verify'],
    tagName: 'v${version}',
  },
  github: {
    autoGenerate: true,
    release: true,
    releaseName: 'v${version}',
  },
  hooks: {
    'after:git:release': 'git checkout production && git reset main --hard && git push origin production --force',
    'after:init': 'pnpm build && pnpm check',
  },
  npm: {
    publish: false,
  },
  plugins: {
    '@release-it/bumper': {
      out: ['apps/*/package.json'],
    },
    '@release-it/conventional-changelog': {
      header: '# Changelog',
      infile: 'CHANGELOG.md',
      preset: {
        name: 'conventionalcommits',
      },
    },
  },
} satisfies Config
