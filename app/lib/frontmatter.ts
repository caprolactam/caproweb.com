// `astro:content`からのインポートをするとビルドサイズが大きくなるので`content`モジュールから分離
import path from 'node:path'
import { z } from 'zod'
import { frontmatters as frontmatterList } from '@/content/frontmatters.ts'

export const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  image: z.string().optional(),
  isDraft: z.boolean(),
})

type Frontmatter = z.infer<typeof frontmatterSchema> & {
  slug: string
}

class Frontmatters {
  private frontmatters: Array<Frontmatter>

  constructor(frontmatters: Array<Frontmatter>) {
    this.frontmatters = frontmatters
  }

  public filteredByTags(tags: Array<string>): Frontmatters {
    if (!tags.length) return new Frontmatters(this.frontmatters)
    const filtered = this.frontmatters.filter((item) =>
      tags.every((tag) => item.tags.includes(tag)),
    )
    return new Frontmatters(filtered)
  }

  public paginate(page: number, size: number): Frontmatters {
    const start = (page - 1) * size
    const paginated = this.frontmatters.slice(start, start + size)
    return new Frontmatters(paginated)
  }

  public toArray(): Array<Frontmatter> {
    return this.frontmatters
  }

  public toAllTags() {
    const tags = this.frontmatters.flatMap((item) => item.tags)
    const tagSet = new Set<string>(tags)

    return Array.from(tagSet)
  }

  /**
   * `filePath`がindex.{md,mdx}の場合は親ディレクトリ名をファイル名として返す
   * それ以外の場合はそのままファイル名を返す
   *
   * ```ts
   * const filename = getSlug('foo/index.mdx')
   * expect(filename).toBe('foo')
   *
   * const filename = getSlug('foo/bar.mdx')
   * expect(filename).toBe('bar')
   * ```
   */
  static getSlug = (filePath: string) => {
    const ext = path.extname(filePath)
    const baseName = path.basename(filePath, ext)

    if (baseName === 'index') {
      return path.basename(path.dirname(filePath))
    }

    return baseName
  }
}

export function listSortedFrontmatters() {
  const withSlug = frontmatterList.map(({ filePath, ...rest }) => ({
    // 型推論がうまくいかないので改めてparse
    ...frontmatterSchema.parse(rest),
    slug: Frontmatters.getSlug(filePath),
  }))

  const filteredDraft = withSlug.filter(({ isDraft }) => {
    return import.meta.env.PROD ? isDraft !== true : true
  })

  const sortedPublishedAt = filteredDraft.sort((a, b) => {
    const aTime = new Date(a.publishedAt).getTime()
    const bTime = new Date(b.publishedAt).getTime()
    return bTime - aTime
  })

  return new Frontmatters(sortedPublishedAt)
}

export const getSlug = Frontmatters.getSlug
