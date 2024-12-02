import typography from '@tailwindcss/typography'
import { type Config } from 'tailwindcss'
import animatePlugin from 'tailwindcss-animate'
import { extendedTheme } from './app/utils/extended-theme.ts'

export default {
  content: [
    './app/**/*.{js,jsx,ts,tsx,mdx}',
    './contents/**/*.{js,jsx,ts,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      ...extendedTheme,
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Commit Mono', 'ui-monospace', 'monospace'],
      },
      typography: {
        brand: {
          css: {
            '--tw-prose-body': "theme('colors.brand[12]')",
            '--tw-prose-headings': "theme('colors.brand[12]')",
            '--tw-prose-lead': "theme('colors.brand[12]')",
            '--tw-prose-links': "theme('colors.brand.link')",
            '--tw-prose-bold': "theme('colors.brand[12]')",
            '--tw-prose-counters': "theme('colors.brand[11]')",
            '--tw-prose-bullets': "theme('colors.brand[11]')",
            '--tw-prose-hr': "theme('colors.brand[9]')",
            '--tw-prose-quotes': "theme('colors.brand[12]')",
            '--tw-prose-quote-borders': "theme('colors.brand[6]')",
            '--tw-prose-captions': "theme('colors.brand[12]')",
            '--tw-prose-code': "theme('colors.brand[12]')",
            '--tw-prose-pre-code': "theme('colors.brand[12]')",
            '--tw-prose-pre-bg': "theme('colors.brand[3]')",
            '--tw-prose-th-borders': "theme('colors.brand[6]')",
            '--tw-prose-td-borders': "theme('colors.brand[6]')",
          },
        },
        DEFAULT: {
          css: {
            h1: {
              fontWeight: 400,
            },
            a: {
              'text-underline-offset': '2px',
            },
            pre: {
              paddingInlineStart: 0,
              paddingInlineEnd: 0,
            },
            'pre code': {
              display: 'inline-block',
              minWidth: '100%',
            },
            code: {
              backgroundColor: "theme('colors.brand[3]')",
              padding: '0.2em 0.4em',
              // whiteSpace: 'break-spaces',
              borderRadius: '6px',
              fontWeight: 'inherit',
            },
            // デフォルトではcodeの前後にバッククォートがついているので削除
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
          },
        },
      },
    },
  },
  plugins: [animatePlugin, typography],
} satisfies Config
