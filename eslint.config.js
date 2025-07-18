import parser from '@typescript-eslint/parser'
import { globalIgnores } from 'eslint/config'
import eslintPluginAstro from 'eslint-plugin-astro'
import globals from 'globals'

const ERROR = 'error'
const WARN = 'warn'

/** @type {import("eslint").Linter.Config} */
export default [
  globalIgnores(['dist', '**/*.d.ts']),
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs['jsx-a11y-recommended'],
  {
    files: ['**/*.{ts,tsx,astro}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        sourceType: 'module',
      },
    },
    rules: {
      'no-undef': 'off',
      'no-warning-comments': [
        ERROR,
        { terms: ['FIXME'], location: 'anywhere' },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
    },
  },
  {
    plugins: {
      import: (await import('eslint-plugin-import-x')).default,
    },
    rules: {
      'import/consistent-type-specifier-style': [ERROR, 'prefer-top-level'],
      'import/order': [
        WARN,
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      'no-unused-vars': [
        WARN,
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^ignored',
        },
      ],
    },
  },
]
