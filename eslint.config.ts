import eslintConfig from '@repo/eslint-config'

export default eslintConfig({
  ignores: ['apps', 'packages'],
  overrides: [
    {
      rules: {
        'no-template-curly-in-string': 0,
      },
    },
  ],
})
