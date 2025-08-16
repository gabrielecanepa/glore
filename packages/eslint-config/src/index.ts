import eslint from '@eslint/js'
import { type Linter } from 'eslint'

import stylisticPlugin from '@stylistic/eslint-plugin'
import gitignoreConfig from 'eslint-config-flat-gitignore'
import importPlugin from 'eslint-plugin-import'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import { config as typescriptConfig, configs as typescriptConfigs } from 'typescript-eslint'

import {
  RuleSeverity,
  type ConfigOptions,
  type RelativeImportsValue,
  type RestrictedImport,
  type ScopedRestrictedImport,
} from './types'
import { configFileOptions, fileOptions, jsxFileOptions, noRestrictedImportsOptions, sortImportsOptions } from './utils'

const BASE_PLUGINS = {
  '@stylistic': stylisticPlugin,
  import: importPlugin,
  perfectionist: perfectionistPlugin,
}

const BASE_CONFIGS = {
  gitignore: gitignoreConfig,
}

const plugins = {
  ...BASE_PLUGINS,
} as typeof BASE_PLUGINS & {
  // @ts-ignore missing type definitions
  '@next/next'?: typeof import('@next/eslint-plugin-next').default
  'better-tailwindcss'?: typeof import('eslint-plugin-better-tailwindcss').default
  'prefer-arrow-functions'?: typeof import('eslint-plugin-prefer-arrow-functions')
  'react-hooks'?: typeof import('eslint-plugin-react-hooks')
  // @ts-ignore missing type definitions
  'sort-array-values'?: typeof import('eslint-plugin-sort-array-values')
  // @ts-ignore missing type definitions
  'sort-destructure-keys'?: typeof import('eslint-plugin-sort-destructure-keys')
  'unused-imports': typeof import('eslint-plugin-unused-imports').default
  prettier?: typeof import('eslint-plugin-prettier')
  react?: typeof import('eslint-plugin-react')
}

const configs = {
  ...BASE_CONFIGS,
} as typeof BASE_CONFIGS & {
  prettier?: typeof import('eslint-config-prettier')
  prettierRecommended?: typeof import('eslint-plugin-prettier/recommended')
  turbo?: typeof import('eslint-config-turbo/flat').default
  typescript?: typeof import('typescript-eslint').config
  typescriptStylistic?: typeof import('typescript-eslint').configs.stylistic
  typescriptRecommended?: typeof import('typescript-eslint').configs.recommendedTypeChecked
  typescriptStrict?: typeof import('typescript-eslint').configs.strictTypeChecked
}

/**
 * ESLint configuration function.
 */
const eslintConfig = async <Rules extends Linter.RulesRecord>(
  options?: ConfigOptions,
  ...userConfig: Linter.Config<Rules>[]
) => {
  const {
    allowRelativeImports = 'siblings',
    bottomImports,
    customExternalImports,
    customInternalImports,
    emptyLineAfterReturn = true,
    exportLast = false,
    files: userFiles,
    ignoreJs = false,
    ignoreTs = false,
    ignores,
    importGroups = [
      ['side-effect', 'side-effect-style'],
      'builtin',
      'custom-external',
      'external',
      'custom-internal',
      'internal',
      ['parent', 'index', 'sibling'],
      'types',
    ],
    includeDotfiles = false,
    includeRoot = true,
    includes,
    internalImports,
    maxLines = 300,
    namedImports,
    newlineAfterImport = true,
    newlinesBetweenGroups = 'always',
    nodePrefix = 'always',
    preferArrow = true,
    prettier = true,
    prettierIncludes,
    react = false,
    removeUnusedImports = true,
    restrictedImports = [],
    rules,
    sortArrays = true,
    sortDestructuredKeys = true,
    sortInterfaces = true,
    sortObjectKeys = true,
    sortProps = true,
    tailwind,
    tsconfig = './tsconfig.json',
    turbo = true,
    typecheck = true,
  } = options || {}

  const files = userFiles ?? fileOptions({ ignoreJs, ignoreTs, includes, includeDotfiles, includeRoot, react })
  const jsxFiles = userFiles ?? jsxFileOptions({ ignoreJs, ignoreTs, includeDotfiles, includeRoot })
  const configFiles = configFileOptions({ ignoreJs, ignoreTs })
  const prettierFiles = prettierIncludes ?? files

  const globalRestrictedImports: RestrictedImport[] = []
  const scopedRestrictedImports: ScopedRestrictedImport[] = []

  for (const restrictedImport of restrictedImports) {
    if (typeof restrictedImport === 'string' || !restrictedImport.files) {
      globalRestrictedImports.push(restrictedImport)
      continue
    }

    const { files: restrictedFiles, ...config } = restrictedImport

    const includes = restrictedFiles.filter(file => !file.startsWith('!'))
    const ignores = restrictedFiles.filter(file => file.startsWith('!')).map(file => file.slice(1))

    const scopedImport = scopedRestrictedImports.find(({ files }) => includes.every(file => files?.includes(file)))

    if (!scopedImport) {
      scopedRestrictedImports.push({
        files: includes,
        ignores,
        restrictedImports: [config],
      })
      continue
    }

    scopedImport.ignores = [...new Set([...(scopedImport.ignores ?? []), ...ignores])]
    scopedImport.restrictedImports = [...(scopedImport.restrictedImports ?? []), config]
  }

  const [relativeImportsValue, relativeImportOptions] =
    typeof allowRelativeImports === 'string' ? [allowRelativeImports] : allowRelativeImports
  const scopedRelativeImports = [] as { files: string[]; value: RelativeImportsValue }[]
  if (relativeImportOptions) {
    for (const [value, files] of Object.entries(relativeImportOptions)) {
      scopedRelativeImports.push({ files, value: value as RelativeImportsValue })
    }
  }

  const hasNextJs = typeof react === 'string' && react === 'nextjs'

  const tsconfigDir = tsconfig.split('/').slice(0, -1).join('/')

  const { allowedClasses, ...tailwindConfig } = tailwind || {}
  const allowedTailwindClasses = [...(allowedClasses ?? []), '^group(?:\\/(\\S*))?$', '^peer(?:\\/(\\S*))?$']

  if (preferArrow) plugins['prefer-arrow-functions'] = (await import('eslint-plugin-prefer-arrow-functions')).default
  if (prettier) plugins.prettier = (await import('eslint-plugin-prettier')).default
  if (react) {
    plugins.react = (await import('eslint-plugin-react')).default
    plugins['react-hooks'] = (await import('eslint-plugin-react-hooks')).default
    // @ts-ignore missing type definitions
    if (hasNextJs) plugins['@next/next'] = (await import('@next/eslint-plugin-next')).default
  }
  // @ts-ignore missing type definitions
  if (sortArrays) plugins['sort-array-values'] = (await import('eslint-plugin-sort-array-values')).default
  if (sortDestructuredKeys)
    // @ts-ignore missing type definitions
    plugins['sort-destructure-keys'] = (await import('eslint-plugin-sort-destructure-keys')).default
  if (tailwind) plugins['better-tailwindcss'] = (await import('eslint-plugin-better-tailwindcss')).default
  if (turbo) configs['turbo'] = (await import('eslint-config-turbo/flat')).default
  if (!ignoreTs) {
    configs.typescript = typescriptConfig
    configs.typescriptStylistic = typescriptConfigs.stylistic
    if (typecheck) {
      configs.typescriptRecommended = typescriptConfigs.recommendedTypeChecked
      configs.typescriptStrict = typescriptConfigs.strictTypeChecked
    }
  }
  if (removeUnusedImports) plugins['unused-imports'] = (await import('eslint-plugin-unused-imports')).default

  return (
    [
      configs.gitignore(),
      eslint.configs.recommended,
      ...(turbo ? configs.turbo! : []),
      {
        name: '@repo/base',
        files,
        plugins: BASE_PLUGINS,
        rules: {
          'comma-dangle': [RuleSeverity.Error, 'always-multiline'],
          eqeqeq: [RuleSeverity.Error, 'always'],
          'func-style': [RuleSeverity.Error, 'expression'],
          'max-lines':
            maxLines === -1
              ? RuleSeverity.Off
              : [
                  RuleSeverity.Error,
                  {
                    max: maxLines,
                    skipBlankLines: true,
                    skipComments: true,
                  },
                ],
          'no-console': [RuleSeverity.Warn, { allow: ['error', 'warn'] }],
          'no-duplicate-imports': [RuleSeverity.Error, { includeExports: true }],
          'no-restricted-imports': [
            RuleSeverity.Error,
            noRestrictedImportsOptions({
              allowRelativeImports: relativeImportsValue,
              namedImports,
              restrictedImports: [...new Set(globalRestrictedImports)],
              nodePrefix,
            }),
          ],
          'no-template-curly-in-string': RuleSeverity.Error,
          'no-useless-concat': RuleSeverity.Error,
          'no-unused-vars': [
            RuleSeverity.Error,
            {
              argsIgnorePattern: '^_',
            },
          ],
          'no-var': RuleSeverity.Error,
          'object-shorthand': [RuleSeverity.Error, 'always'],
          'padding-line-between-statements': emptyLineAfterReturn
            ? [
                RuleSeverity.Error,
                { blankLine: 'always', next: '*', prev: 'break' },
                { blankLine: 'always', next: '*', prev: 'continue' },
                { blankLine: 'always', next: '*', prev: 'return' },
              ]
            : RuleSeverity.Off,
          'prefer-arrow-callback': [
            RuleSeverity.Error,
            {
              allowNamedFunctions: true,
            },
          ],
          'prefer-const': [
            RuleSeverity.Error,
            {
              destructuring: 'any',
              ignoreReadBeforeAssign: false,
            },
          ],
          'prefer-template': RuleSeverity.Error,
          'sort-vars': [
            RuleSeverity.Error,
            {
              ignoreCase: false,
            },
          ],
          '@stylistic/array-bracket-newline': [RuleSeverity.Error, 'consistent'],
          '@stylistic/array-bracket-spacing': [RuleSeverity.Error, 'never'],
          '@stylistic/array-element-newline': [RuleSeverity.Error, 'consistent'],
          '@stylistic/eol-last': RuleSeverity.Error,
          '@stylistic/max-len': RuleSeverity.Off,
          '@stylistic/no-extra-semi': RuleSeverity.Off,
          '@stylistic/no-multi-spaces': RuleSeverity.Error,
          '@stylistic/no-multiple-empty-lines': [
            RuleSeverity.Error,
            {
              max: 1,
            },
          ],
          '@stylistic/no-trailing-spaces': RuleSeverity.Error,
          '@stylistic/object-curly-spacing': [RuleSeverity.Error, 'always'],
          '@stylistic/quotes': [
            RuleSeverity.Error,
            'single',
            {
              avoidEscape: true,
            },
          ],
          '@stylistic/template-curly-spacing': [RuleSeverity.Error, 'never'],
          'import/exports-last': exportLast ? RuleSeverity.Error : RuleSeverity.Off,
          'import/first': RuleSeverity.Error,
          ...(!newlineAfterImport
            ? {
                'import/newline-after-import': [
                  RuleSeverity.Error,
                  {
                    considerComments: true,
                    exactCount: true,
                  },
                ],
              }
            : {}),
          'import/no-absolute-path': RuleSeverity.Off,
          'import/no-amd': RuleSeverity.Error,
          'import/no-commonjs': RuleSeverity.Error,
          'import/no-deprecated': RuleSeverity.Error,
          'import/no-duplicates': [
            RuleSeverity.Error,
            {
              'prefer-inline': true,
            },
          ],
          'import/no-empty-named-blocks': RuleSeverity.Error,
          'import/no-mutable-exports': RuleSeverity.Error,
          'import/no-self-import': RuleSeverity.Error,
          'import/no-useless-path-segments': [
            RuleSeverity.Error,
            {
              noUselessIndex: true,
            },
          ],
          'perfectionist/sort-exports': RuleSeverity.Error,
          'perfectionist/sort-imports': [
            RuleSeverity.Error,
            sortImportsOptions({
              bottomImports,
              customExternalImports,
              customInternalImports,
              importGroups,
              internalImports,
              newlinesBetweenGroups,
              tsconfig,
            }),
          ],
          'perfectionist/sort-named-imports': [
            RuleSeverity.Error,
            {
              groupKind: 'values-first',
              ignoreCase: false,
              type: 'alphabetical',
            },
          ],
        },
      },
      ...(scopedRestrictedImports.length > 0
        ? scopedRestrictedImports.map(({ files, ignores = [], restrictedImports }) => ({
            files,
            ignores,
            rules: {
              'no-restricted-imports': [
                RuleSeverity.Error,
                noRestrictedImportsOptions({
                  allowRelativeImports,
                  namedImports,
                  restrictedImports,
                  nodePrefix,
                }),
              ],
            },
          }))
        : []),
      ...(scopedRelativeImports.length > 0
        ? scopedRelativeImports.map(scopedImports => ({
            files: scopedImports.files,
            rules: {
              'no-restricted-imports': [
                RuleSeverity.Error,
                noRestrictedImportsOptions({
                  allowRelativeImports: scopedImports.value,
                  namedImports,
                  nodePrefix,
                }),
              ],
            },
          }))
        : []),
      preferArrow && {
        name: '@repo/prefer-arrow',
        files,
        plugins: {
          'prefer-arrow-functions': plugins['prefer-arrow-functions'],
        },
        rules: {
          'prefer-arrow-functions/prefer-arrow-functions': [
            RuleSeverity.Error,
            {
              allowObjectProperties: true,
            },
          ],
        },
      },
      removeUnusedImports && {
        name: '@repo/unused-imports',
        files,
        plugins: {
          'unused-imports': plugins['unused-imports'],
        },
        rules: {
          'unused-imports/no-unused-imports': RuleSeverity.Error,
        },
      },
      sortArrays && {
        files: Array.isArray(sortArrays) ? sortArrays : files,
        plugins: {
          'sort-array-values': plugins['sort-array-values'],
        },
        rules: {
          'sort-array-values/sort-array-values': RuleSeverity.Error,
        },
      },
      sortDestructuredKeys && {
        files: Array.isArray(sortDestructuredKeys) ? sortDestructuredKeys : files,
        plugins: {
          'sort-destructure-keys': plugins['sort-destructure-keys'],
        },
        rules: {
          'sort-destructure-keys/sort-destructure-keys': RuleSeverity.Error,
        },
      },
      sortObjectKeys && {
        files: Array.isArray(sortObjectKeys) ? sortObjectKeys : files,
        rules: {
          'perfectionist/sort-objects': RuleSeverity.Error,
        },
      },
      ...(ignoreTs || !configs.typescript
        ? []
        : configs.typescript(
            {
              ignores: ['**/*.?(c|m)js'],
            },
            configs.typescriptStylistic!,
            typecheck === true ? configs.typescriptRecommended! : {},
            typecheck === 'strict' ? configs.typescriptStrict! : {},
            {
              name: '@repo/ts',
              languageOptions: {
                parserOptions: {
                  ecmaFeatures: {
                    jsx: !!react,
                  },
                  projectService: true,
                  tsconfigRootDir: tsconfigDir,
                },
              },
              settings: {
                'import/resolver': {
                  typescript: true,
                },
              },
              plugins: {
                '@stylistic': plugins['@stylistic'],
                perfectionist: plugins.perfectionist,
                ...(react
                  ? {
                      react: plugins.react,
                      'react-hooks': plugins['react-hooks'],
                      ...(hasNextJs
                        ? {
                            '@next/next': plugins['@next/next'],
                          }
                        : {}),
                    }
                  : {}),
              },
              rules: {
                'no-unused-vars': RuleSeverity.Off,
                '@stylistic/member-delimiter-style': [
                  RuleSeverity.Error,
                  {
                    multiline: {
                      delimiter: 'none',
                      requireLast: false,
                    },
                  },
                ],
                '@typescript-eslint/array-type': RuleSeverity.Error,
                '@typescript-eslint/consistent-type-imports': [
                  RuleSeverity.Error,
                  {
                    disallowTypeAnnotations: false,
                    fixStyle: 'inline-type-imports',
                    prefer: 'type-imports',
                  },
                ],
                '@typescript-eslint/no-empty-object-type': [
                  RuleSeverity.Error,
                  {
                    allowInterfaces: 'always',
                  },
                ],
                '@typescript-eslint/no-misused-promises': [
                  RuleSeverity.Error,
                  {
                    checksVoidReturn: {
                      attributes: false,
                    },
                  },
                ],
                '@typescript-eslint/no-unnecessary-template-expression': RuleSeverity.Error,
                '@typescript-eslint/no-unused-vars': [
                  RuleSeverity.Error,
                  {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                    varsIgnorePattern: '^_',
                  },
                ],
                '@typescript-eslint/prefer-for-of': RuleSeverity.Error,
                '@typescript-eslint/prefer-string-starts-ends-with': RuleSeverity.Error,
                '@typescript-eslint/restrict-template-expressions': [
                  RuleSeverity.Error,
                  {
                    allowNumber: true,
                  },
                ],
                '@typescript-eslint/unbound-method': RuleSeverity.Off,
                'perfectionist/sort-interfaces': sortInterfaces === true ? RuleSeverity.Error : RuleSeverity.Off,
              },
            },
            Array.isArray(sortInterfaces)
              ? {
                  files: sortInterfaces,
                  name: '@repo/ts/interfaces',
                  rules: {
                    'perfectionist/sort-interfaces': RuleSeverity.Error,
                  },
                }
              : {},
            {
              files: ['**/*.d.ts', '**/types.ts'],
              name: '@repo/dts',
              rules: {
                'max-lines': RuleSeverity.Off,
              },
            },
          )),
      react && {
        name: '@repo/react',
        files: jsxFiles,
        plugins: {
          plugins: {
            react: plugins.react,
            'react-hooks': plugins['react-hooks'],
            ...(hasNextJs
              ? {
                  '@next/next': plugins['@next/next'],
                }
              : {}),
          },
        },
        rules: {
          ...plugins.react!.configs['jsx-runtime'].rules,
          ...plugins['react-hooks']!.configs.recommended.rules,
          ...(hasNextJs && plugins['@next/next']
            ? {
                ...plugins['@next/next'].configs.recommended.rules,
                ...plugins['@next/next'].configs['core-web-vitals'].rules,
              }
            : {}),
          '@stylistic/jsx-curly-brace-presence': [
            RuleSeverity.Error,
            {
              children: 'always',
              propElementValues: 'always',
              props: 'never',
            },
          ],
          'perfectionist/sort-jsx-props': sortProps === true ? RuleSeverity.Error : RuleSeverity.Off,
          'react/jsx-key': RuleSeverity.Error,
          'react/jsx-uses-react': RuleSeverity.Off,
          'react/react-in-jsx-scope': RuleSeverity.Off,
          'react-hooks/exhaustive-deps': [
            RuleSeverity.Warn,
            {
              enableDangerousAutofixThisMayCauseInfiniteLoops: true,
            },
          ],
        },
      },
      {
        name: '@repo/configs',
        files: configFiles,
        rules: {
          'no-restricted-imports': RuleSeverity.Off,
          'no-template-curly-in-string': RuleSeverity.Off,
          'import/newline-after-import': RuleSeverity.Off,
          'import/no-anonymous-default-export': RuleSeverity.Off,
          'sort-array-values/sort-array-values': RuleSeverity.Off,
          '@typescript-eslint/no-unsafe-return': RuleSeverity.Off,
        },
      },
      ...(prettier
        ? [
            {
              files: prettierFiles,
              name: '@repo/prettier',
              plugins: {
                prettier: plugins.prettier,
              },
              rules: {
                'prettier/prettier': [
                  RuleSeverity.Error,
                  ...(typeof prettier === 'object' ? [prettier] : [{}, { usePrettierrc: true }]),
                ],
              },
            },
            configs.prettier,
            configs.prettierRecommended,
          ]
        : []),
      tailwind && {
        name: '@repo/tailwind',
        files,
        languageOptions: react
          ? {
              parserOptions: {
                ecmaFeatures: {
                  jsx: true,
                },
              },
            }
          : {},
        plugins: {
          'better-tailwindcss': plugins['better-tailwindcss'],
        },
        settings: {
          'better-tailwindcss': tailwindConfig,
        },
        rules: {
          'better-tailwindcss/no-conflicting-classes': RuleSeverity.Error,
          'better-tailwindcss/no-duplicate-classes': RuleSeverity.Error,
          'better-tailwindcss/multiline': [
            RuleSeverity.Error,
            {
              group: 'newLine',
              preferSingleLine: true,
              printWidth: 160,
            },
          ],
          'better-tailwindcss/no-restricted-classes': RuleSeverity.Error,
          'better-tailwindcss/no-unnecessary-whitespace': RuleSeverity.Error,
          'better-tailwindcss/no-unregistered-classes': [
            RuleSeverity.Error,
            {
              ignore: allowedTailwindClasses,
            },
          ],
          'better-tailwindcss/sort-classes': RuleSeverity.Error,
        },
      },
      {
        files,
        rules: {
          'arrow-body-style': [RuleSeverity.Error, 'as-needed'],
        },
      },
      rules && {
        name: '@repo/rules',
        rules,
      },
      ...userConfig,
    ] as Linter.Config<Rules>[]
  )
    .filter(config => typeof config === 'object' && Object.keys(config).length > 0)
    .map(config => {
      const configIgnores = [...(ignores ?? []), ...(config.ignores ?? [])]
      if (configIgnores.length) return { ...config, ignores: configIgnores }
      return config
    })
}

export default eslintConfig
export type { ConfigOptions }
export * from './types'
