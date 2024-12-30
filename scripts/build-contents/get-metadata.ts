import fs from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import fm from 'front-matter'
import fsExtra from 'fs-extra'
import { frontmatterSchema, type Metadata } from '#app/utils/markdown.server.ts'
import { getFileInfo } from './serialize-mdx'

const outputDir = path.join(process.cwd(), 'app', 'utils', 'metadata')
await fsExtra.ensureDir(outputDir)

export async function getMetadatas() {
  const metadatas: Array<Metadata> = []

  const filePaths = await fg('contents/**/*.{md,mdx}')

  await Promise.all(filePaths.map((filePath) => getMetadata(filePath)))

  await fs.writeFile(
    path.join(outputDir, 'metadata.json'),
    JSON.stringify(metadatas),
  )

  async function getMetadata(filePath: string) {
    const { fileNameWithoutExt } = getFileInfo(filePath)
    const file = await fs.readFile(filePath, 'utf-8')

    const { attributes } = fm(file)
    const frontmatter = frontmatterSchema.parse(attributes)

    metadatas.push({
      ...frontmatter,
      fileNameWithoutExt,
    })
  }
}
