import { type Config } from 'prettier'

const prettierConfig: Config = {
  arrowParens: 'avoid',
  printWidth: 120,
  quoteProps: 'as-needed',
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  plugins: [],
  overrides: [
    {
      files: ['*.css'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: ['*.json'],
      options: {
        printWidth: 100,
        singleQuote: false,
        trailingComma: 'none',
      },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        printWidth: 100,
      },
    },
    {
      files: ['.github/workflows/*.yml'],
      options: {
        printWidth: 100,
        singleQuote: true,
      },
    },
    {
      files: ['.vscode/*.json'],
      options: {
        printWidth: 200,
      },
    },
    {
      files: ['*.xml'],
      options: {
        printWidth: 100,
        singleQuote: false,
        trailingComma: 'none',
      },
    },
  ],
}

export default prettierConfig
