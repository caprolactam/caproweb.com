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
      colors: {
        transparent: 'transparent',
        revert: 'revert',
        brand: {
          1: 'hsl(var(--sand1) / <alpha-value>)',
          2: 'hsl(var(--sand2) / <alpha-value>)',
          3: 'hsl(var(--sand3) / <alpha-value>)',
          4: 'hsl(var(--sand4) / <alpha-value>)',
          5: 'hsl(var(--sand5) / <alpha-value>)',
          6: 'hsl(var(--sand6) / <alpha-value>)',
          7: 'hsl(var(--sand7) / <alpha-value>)',
          8: 'hsl(var(--sand8) / <alpha-value>)',
          9: 'hsl(var(--sand9) / <alpha-value>)',
          10: 'hsl(var(--sand10) / <alpha-value>)',
          11: 'hsl(var(--sand11) / <alpha-value>)',
          12: 'hsl(var(--sand12) / <alpha-value>)',
          'add-bg': 'hsl(var(--add-bg) / <alpha-value>)',
          'add-text': 'hsl(var(--add-text) / <alpha-value>)',
          'remove-bg': 'hsl(var(--remove-bg) / <alpha-value>)',
          'remove-text': 'hsl(var(--remove-text) / <alpha-value>)',
          link: 'hsl(var(--link) / <alpha-value>)',
        },
        red: {
          1: 'hsl(var(--red1) / <alpha-value>)',
          2: 'hsl(var(--red2) / <alpha-value>)',
          3: 'hsl(var(--red3) / <alpha-value>)',
          4: 'hsl(var(--red4) / <alpha-value>)',
          5: 'hsl(var(--red5) / <alpha-value>)',
          6: 'hsl(var(--red6) / <alpha-value>)',
          7: 'hsl(var(--red7) / <alpha-value>)',
          8: 'hsl(var(--red8) / <alpha-value>)',
          9: 'hsl(var(--red9) / <alpha-value>)',
          10: 'hsl(var(--red10) / <alpha-value>)',
          11: 'hsl(var(--red11) / <alpha-value>)',
          12: 'hsl(var(--red12) / <alpha-value>)',
        },
        green: {
          1: 'hsl(var(--green1) / <alpha-value>)',
          2: 'hsl(var(--green2) / <alpha-value>)',
          3: 'hsl(var(--green3) / <alpha-value>)',
          4: 'hsl(var(--green4) / <alpha-value>)',
          5: 'hsl(var(--green5) / <alpha-value>)',
          6: 'hsl(var(--green6) / <alpha-value>)',
          7: 'hsl(var(--green7) / <alpha-value>)',
          8: 'hsl(var(--green8) / <alpha-value>)',
          9: 'hsl(var(--green9) / <alpha-value>)',
          10: 'hsl(var(--green10) / <alpha-value>)',
          11: 'hsl(var(--green11) / <alpha-value>)',
          12: 'hsl(var(--green12) / <alpha-value>)',
        },
        // Start: shadcn themes
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // End: shadcn themes
      },
      opacity: {
        8: '0.08',
        12: '0.12',
        32: '0.32',
        38: '0.38',
      },
      transitionDuration: {
        '850': '850ms',
      },
      // Start: shadcn themes
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      // End: shadcn themes
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
