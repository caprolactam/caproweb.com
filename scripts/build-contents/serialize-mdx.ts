import fs from 'node:fs/promises'
import path from 'node:path'
import { compile } from '@mdx-js/mdx'
import fm from 'front-matter'
import fsExtra from 'fs-extra'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkHeadingId from 'remark-custom-header-id'
import remarkGfm from 'remark-gfm'
import { z } from 'zod'
import {
  frontmatterSchema,
  type Frontmatter,
} from '#app/utils/markdown.server.ts'
import { rehypeCodeHighlight } from './custom-syntax-highlighter.ts'

const outputDir = path.join(process.cwd(), 'prebuild', 'contents')
await fsExtra.ensureDir(outputDir)

const allowedExtensions = z.enum(['md', 'mdx'])
type AllowedExtensions = z.infer<typeof allowedExtensions>

export type SerializedSource = {
  frontmatter: Frontmatter
  serializedMdx: string
}

export async function createSerializedMdx(filePath: string): Promise<void> {
  const file = await fs.readFile(filePath, 'utf-8')

  const { attributes, body } = fm(file)
  const frontmatter = frontmatterSchema.parse(attributes)

  const { fileNameWithoutExt, format } = getFileInfo(filePath)

  const serializedMdx = await compile(
    body,
    createSerializeOptions(format),
  ).then((data) => String(data))

  await fs.writeFile(
    path.join(outputDir, `${fileNameWithoutExt}.json`),
    JSON.stringify({
      frontmatter,
      serializedMdx,
    } satisfies SerializedSource),
    'utf-8',
  )
}

function createSerializeOptions(
  format: AllowedExtensions,
): Parameters<typeof compile>[1] {
  return {
    remarkPlugins: [remarkGfm, remarkHeadingId],
    rehypePlugins: [
      rehypeCodeHighlight,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: {
            title: 'このセクションのURL',
            tabIndex: -1,
            ariaHidden: true,
          },
        },
      ],
    ],
    format,
    outputFormat: 'function-body',
  }
}

/**
 * ファイル名がindexの場合はディレクトリ名をファイル名として返す
 * それ以外の場合はそのままファイル名を返す
 */
export function getFileInfo(filePath: string): {
  fileNameWithoutExt: string
  format: AllowedExtensions
} {
  const originalFileName = path.basename(filePath)
  const ext = path.extname(originalFileName)
  const format = allowedExtensions.parse(ext.slice(1))

  let fileNameWithoutExt = path.basename(originalFileName, ext)

  if (fileNameWithoutExt === 'index') {
    const parentDir = path.basename(path.dirname(filePath))
    fileNameWithoutExt = parentDir
  } else {
  }

  return { fileNameWithoutExt, format }
}

export async function listContentPaths(filePaths: Array<string>) {
  // const filePaths = await fg('prebuild/contents/*.json')

  const contents = await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        const rawJson = await fs.readFile(filePath, 'utf-8')

        const { frontmatter } = z
          .object({ frontmatter: frontmatterSchema })
          .parse(JSON.parse(rawJson))

        const fileName = path.basename(filePath)
        const ext = path.extname(fileName)
        const fileNameWithoutExt = path.basename(fileName, ext)

        return {
          ...frontmatter,
          fileName,
          fileNameWithoutExt,
          // remove the leading dot
          ext: ext.slice(1),
        }
      } catch (error) {
        console.error(error)
        return null
      }
    }),
  ).then((data) => data.filter(Boolean))

  return contents
}
