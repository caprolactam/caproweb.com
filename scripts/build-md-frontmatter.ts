import fs from 'node:fs/promises'
import nodePath from 'node:path'
import fg from 'fast-glob'
import matter from 'front-matter'
import { type Plugin } from 'vite'

class MetadataProvider {
  private code: unknown[] = []
  constructor() {}

  public add(data: { path: string; filename: string; data: unknown }): void {
    this.code.push(data)
  }
  public export(): string {
    return `export const metadatas = ${JSON.stringify(this.code, null, 2)}`
  }
}

export function parseMarkdownFrontmatter(): Plugin {
  const pluginId = 'parse-markdown-frontmatter'
  const virtualModuleId = `virtual:${pluginId}`
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: `vite-plugin-${pluginId}`,
    enforce: 'pre',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const metadataProvider = new MetadataProvider()
        const markdownPaths = await fg.glob('contents/**/*.md')

        await Promise.all(
          markdownPaths.map(async (path) => {
            const code = await fs.readFile(path, 'utf-8')
            const { attributes } = matter(code)
            const filename = nodePath.basename(path, nodePath.extname(path))

            metadataProvider.add({
              path,
              filename,
              data: attributes,
            })
          }),
        ).catch(console.error)

        return {
          code: metadataProvider.export(),
        }
      }
    },
  }
}
