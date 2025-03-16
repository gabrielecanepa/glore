import eslint from '@eslint/js'
import { type Linter } from 'eslint'

// @ts-expect-error - Missing type definitions
import nextPlugin from '@next/eslint-plugin-next'
// @ts-expect-error - Missing type definitions
import pandaCssPlugin from '@pandacss/eslint-plugin'
import stylisticPlugin from '@stylistic/eslint-plugin'
import stylisticTsPlugin from '@stylistic/eslint-plugin-ts'
import gitignoreConfig from 'eslint-config-flat-gitignore'
import prettierConfig from 'eslint-config-prettier'
import turboConfig from 'eslint-config-turbo/flat'
// @ts-expect-error - Missing type definitions
import importPlugin from 'eslint-plugin-import'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import preferArrowFunctionsPlugin from 'eslint-plugin-prefer-arrow-functions'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
// @ts-expect-error - Missing type definitions
import sortArrayValuesPlugin from 'eslint-plugin-sort-array-values'
// @ts-expect-error - Missing type definitions
import sortDestructureKeysPlugin from 'eslint-plugin-sort-destructure-keys'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'
import { config as typescriptConfig, configs as typescriptConfigs } from 'typescript-eslint'

import { RuleSeverity, type EslintConfigOptions } from './types'
import { configFileOptions, fileOptions, jsxFileOptions, noRestrictedImportsOptions, sortImportsOptions } from './utils'

const DEFAULT_OPTIONS: EslintConfigOptions = {
  allowRelativeImports: 'siblings',
  emptyLineAfterReturn: true,
  exportsLast: true,
  ignoreJs: false,
  ignoreTs: false,
  importGroups: [['side-effect', 'side-effect-style'], 'builtin', 'external', 'internal', ['parent', 'index', 'sibling']],
  includeDotfiles: false,
  includeRoot: true,
  react: false,
  maxLines: 300,
  newlineAfterImport: true,
  newlinesBetweenGroups: 'always',
  pandaCss: false,
  prettier: true,
  sortArrayValues: true,
  sortDestructuredKeys: true,
  sortInterfaces: true,
  sortObjectKeys: true,
  tsconfigRootDir: '.',
  useNodePrefix: 'always',
  tailwindCss: false,
  typeCheck: true,
  sortProps: true,
}

/**
 * ESLint configuration function.
 */
const eslintConfig = (options: EslintConfigOptions = {}): Linter.Config[] => {
  const {
    allowRelativeImports,
    emptyLineAfterReturn,
    exportsLast,
    files: userFiles,
    ignoreJs,
    ignoreTs,
    ignores,
    importGroups,
    includeDotfiles,
    includeRoot,
    internalImports,
    maxLines,
    namedImports,
    newlineAfterImport,
    newlinesBetweenGroups,
    overrides,
    pandaCss,
    prettier,
    prettierIncludes,
    react,
    restrictedImports,
    sortArrayValues,
    sortDestructuredKeys,
    sortInterfaces,
    sortObjectKeys,
    sortProps,
    tailwindCss,
    tsconfigRootDir,
    typeCheck,
    useNodePrefix,
  } = { ...DEFAULT_OPTIONS, ...options }

  const files = userFiles ?? fileOptions({ ignoreJs, ignoreTs, includeDotfiles, includeRoot, react })
  const jsxFiles = userFiles ?? jsxFileOptions({ ignoreJs, ignoreTs, includeDotfiles, includeRoot })
  const configFiles = configFileOptions({ ignoreJs, ignoreTs })
  const prettierFiles = prettierIncludes ?? files
  const hasNextJs = typeof react === 'string' && react === 'nextjs'

  return (
    [
      gitignoreConfig(),
      eslint.configs.recommended,
      ...turboConfig,
      {
        name: '@repo/base',
        files,
        plugins: {
          '@stylistic': stylisticPlugin,
          import: importPlugin,
          perfectionist: perfectionistPlugin,
          'prefer-arrow-functions': preferArrowFunctionsPlugin,
          'sort-array-values': sortArrayValuesPlugin,
          'sort-destructure-keys': sortDestructureKeysPlugin,
          'unused-imports': unusedImportsPlugin,
        },
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
            noRestrictedImportsOptions({ allowRelativeImports, namedImports, restrictedImports, useNodePrefix }),
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
          'import/exports-last': exportsLast ? RuleSeverity.Error : RuleSeverity.Off,
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
            sortImportsOptions({ importGroups, internalImports, newlinesBetweenGroups, tsconfigRootDir }),
          ],
          'perfectionist/sort-named-imports': [
            RuleSeverity.Error,
            {
              groupKind: 'values-first',
              ignoreCase: false,
              type: 'alphabetical',
            },
          ],
          'perfectionist/sort-objects': sortObjectKeys === true ? RuleSeverity.Error : RuleSeverity.Off,
          'prefer-arrow-functions/prefer-arrow-functions': RuleSeverity.Error,
          'sort-array-values/sort-array-values': sortArrayValues === true ? RuleSeverity.Error : RuleSeverity.Off,
          'sort-destructure-keys/sort-destructure-keys': sortDestructuredKeys === true ? RuleSeverity.Error : RuleSeverity.Off,
          'unused-imports/no-unused-imports': RuleSeverity.Error,
        },
      },
      Array.isArray(sortArrayValues)
        ? {
            files: sortArrayValues,
            plugins: {
              'sort-array-values': sortArrayValuesPlugin,
            },
            rules: {
              'sort-array-values/sort-array-values': RuleSeverity.Error,
            },
          }
        : {},
      Array.isArray(sortDestructuredKeys)
        ? {
            files: sortDestructuredKeys,
            rules: {
              'sort-destructure-keys/sort-destructure-keys': RuleSeverity.Error,
            },
          }
        : {},
      Array.isArray(sortObjectKeys)
        ? {
            files: sortObjectKeys,
            rules: {
              'perfectionist/sort-objects': RuleSeverity.Error,
            },
          }
        : {},
      ...(ignoreTs
        ? []
        : typescriptConfig(
            {
              ignores: ['**/*.?(c|m)js'],
            },
            typescriptConfigs.stylistic,
            typeCheck === true ? typescriptConfigs.recommendedTypeChecked : {},
            typeCheck === 'strict' ? typescriptConfigs.strictTypeChecked : {},
            {
              name: '@repo/ts',
              languageOptions: {
                parserOptions: {
                  ecmaFeatures: {
                    jsx: !!react,
                  },
                  projectService: true,
                  tsconfigRootDir: '.',
                },
              },
              settings: {
                'import/resolver': {
                  typescript: true,
                },
              },
              plugins: {
                '@stylistic/ts': stylisticTsPlugin,
                perfectionist: perfectionistPlugin,
                react: reactPlugin,
                'react-hooks': reactHooksPlugin,
                ...(hasNextJs
                  ? {
                      '@next/next': nextPlugin,
                    }
                  : {}),
              },
              rules: {
                'no-unused-vars': RuleSeverity.Off,
                '@stylistic/ts/member-delimiter-style': [
                  RuleSeverity.Error,
                  {
                    multiline: {
                      delimiter: 'none',
                      requireLast: false,
                    },
                  },
                ],
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
      react
        ? {
            name: '@repo/react',
            files: jsxFiles,
            plugins: {
              plugins: {
                react: reactPlugin,
                'react-hooks': reactHooksPlugin,
                ...(hasNextJs
                  ? {
                      '@next/next': nextPlugin,
                    }
                  : {}),
              },
            },
            rules: {
              ...reactPlugin.configs['jsx-runtime'].rules,
              ...reactHooksPlugin.configs.recommended.rules,
              ...(hasNextJs
                ? {
                    ...nextPlugin.configs.recommended.rules,
                    ...nextPlugin.configs['core-web-vitals'].rules,
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
              'react/jsx-uses-react': RuleSeverity.Off,
              'react/react-in-jsx-scope': RuleSeverity.Off,
            },
          }
        : {},
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
      pandaCss
        ? {
            files: ['panda.config.[jt]s', ...files],
            name: '@repo/pandacss',
            plugins: {
              '@pandacss': pandaCssPlugin,
            },
            rules: {
              ...Object.keys(pandaCssPlugin.configs.all.rules).reduce(
                (rules, name) => ({ ...rules, [name]: RuleSeverity.Error }),
                {},
              ),
              '@pandacss/no-margin-properties': RuleSeverity.Off,
              '@pandacss/no-physical-properties': RuleSeverity.Off,
              '@pandacss/prefer-atomic-properties': RuleSeverity.Off,
              '@pandacss/prefer-composite-properties': RuleSeverity.Off,
              '@pandacss/prefer-longhand-properties': RuleSeverity.Off,
              '@pandacss/prefer-shorthand-properties': RuleSeverity.Off,
              '@pandacss/prefer-unified-property-style': RuleSeverity.Off,
            },
          }
        : {},
      ...(prettier
        ? [
            {
              files: prettierFiles,
              name: '@repo/prettier',
              plugins: {
                prettier: prettierPlugin,
              },
              rules: {
                'prettier/prettier': [
                  RuleSeverity.Error,
                  ...(typeof prettier === 'object' ? [prettier] : [{}, { usePrettierRc: true }]),
                ],
              },
            },
            prettierConfig,
            prettierPluginRecommended,
          ]
        : []),
      tailwindCss
        ? {
            name: '@repo/tailwindcss',
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
            plugins: {},
            rules: {},
          }
        : {},
      {
        name: '@repo/overrides',
        files,
        rules: {
          'arrow-body-style': [RuleSeverity.Error, 'as-needed'],
        },
      },
      ...(overrides ?? []),
    ] as Linter.Config[]
  )
    .filter(config => Object.keys(config).length > 0)
    .map(config => {
      const configIgnores = [...(ignores ?? []), ...((config as Linter.Config).ignores ?? [])]
      if (configIgnores.length) return { ...config, ignores: configIgnores }
      return config
    })
}

export default eslintConfig
export type { EslintConfigOptions }
export type * from './types'
