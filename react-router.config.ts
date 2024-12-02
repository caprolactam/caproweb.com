import { type Config } from '@react-router/dev/config'
import fg from 'fast-glob'
import { listContentPaths } from './scripts/build-contents/serialize-mdx'

export default {
  serverModuleFormat: 'esm',
  ssr: true,
  async prerender() {
    const files = await listContentPaths(await fg('prebuild/contents/*.json'))

    const staticPaths = ['/']

    return staticPaths.concat(
      files
        .map((file) =>
          file.draft ? null : `/contents/${file.fileNameWithoutExt}`,
        )
        .filter(Boolean),
    )
  },
  future: {
    unstable_optimizeDeps: true,
  },
} satisfies Config
