import { reactRouter } from '@react-router/dev/vite'
import { cloudflareDevProxy } from '@react-router/dev/vite/cloudflare'
import { defineConfig, type UserConfigExport } from 'vite'
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
    plugins: [
      envOnlyMacros(),
      cloudflareDevProxy({ getLoadContext }),
      reactRouter(),
    ],
  } satisfies UserConfigExport
})
