import { reactRouter } from '@react-router/dev/vite'
import { cloudflareDevProxy } from '@react-router/dev/vite/cloudflare'
import {
  defineConfig,
  defaultServerConditions,
  type UserConfigExport,
} from 'vite'
import { envOnlyMacros } from 'vite-env-only'
import { getLoadContext } from './load-context'

export default defineConfig(async ({ mode }) => {
  return {
    build: {
      cssMinify: mode === 'production',
      assetsInlineLimit: (source: string) => {
        if (source.endsWith('sprite.svg')) {
          return false
        }
      },
    },
    ssr: {
      target: 'webworker',
      // https://vite.dev/guide/migration.html#default-value-for-resolve-conditions
      resolve: {
        conditions: [
          ...new Set([
            'workerd',
            'worker',
            'browser',
            ...defaultServerConditions,
          ]),
        ],
        externalConditions: [
          ...new Set(['workerd', 'worker', ...defaultServerConditions]),
        ],
      },
    },
    resolve: {
      mainFields: ['browser', 'module', 'main'],
    },
    plugins: [
      envOnlyMacros(),
      cloudflareDevProxy({ getLoadContext }),
      reactRouter(),
    ],
  } satisfies UserConfigExport
})
