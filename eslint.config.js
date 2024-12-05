import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { default as defaultConfig } from '@epic-web/config/eslint'
import { includeIgnoreFile } from '@eslint/compat'
import markdownPlugin from '@eslint/markdown'
import prettierPlugin from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tailwindPlugin from 'eslint-plugin-tailwindcss'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

// TODO: add eslint-plugin-storybook when available for flat config

/** @type {import("eslint").Linter.Config} */
export default [
  ...defaultConfig,
  ...tailwindPlugin.configs['flat/recommended'],
  jsxA11y.flatConfigs.recommended,
  {
    files: ['**/*.md'],
    plugins: {
      markdown: markdownPlugin,
    },
    language: 'markdown/gfm',
    rules: {
      'markdown/fenced-code-language': 'error',
      'markdown/heading-increment': 'error',
      'markdown/no-duplicate-headings': 'error',
      'markdown/no-empty-links': 'error',
      'markdown/no-html': 'error',
      'markdown/no-invalid-label-refs': 'error',
      'markdown/no-missing-label-refs': 'error',
    },
  },
  prettierPlugin,
  includeIgnoreFile(gitignorePath),
]