import fs from 'node:fs/promises'
import path from 'node:path'
import { data } from 'react-router'
import { z } from 'zod'
import { frontmatterSchema } from '#app/utils/markdown.server.ts'

export function validateSlug(slug: string): void {
  const rule = /^[a-z0-9\-]+$/i

  if (!rule.test(slug)) {
    throw data(
      {
        message: 'コンテンツが見つかりません',
      },
      {
        status: 404,
      },
    )
  }
}

export async function getMdxSource(slug: string) {
  try {
    // node runtime(build environment)
    const filePath = path.join(
      process.cwd(),
      'prebuild',
      'contents',
      `${slug}.json`,
    )

    const file = await fs
      .readFile(filePath, 'utf-8')
      .then((data) => JSON.parse(data))
      .then((data) => {
        return z
          .object({
            frontmatter: frontmatterSchema,
            serializedMdx: z.string(),
          })
          .parse(data)
      })

    return file
  } catch (error) {
    // edge runtime(prodution environment)
    console.error(error)
    return null
  }
}
