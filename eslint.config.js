import js from '@eslint/js'
import eslintPluginAstro from 'eslint-plugin-astro'
import importX from 'eslint-plugin-import-x'

export default [
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.astro'],
    ...js.configs.recommended,
  },
  {
    files: ['**/*.astro'],
    ...importX.flatConfigs.recommended,
    rules: {
      'import-x/order': [
        'warn',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [{ pattern: '#*/**', group: 'internal' }],
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
]
