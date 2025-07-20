import { generateSitemap } from '@forge42/seo-tools/sitemap'
import type { SitemapRoute } from '@forge42/seo-tools/sitemap'
import type { APIRoute } from 'astro'
import { listSortedFrontmatters } from '@/lib/frontmatter.ts'
import { formatDate } from '@/lib/utils.ts'

export const GET: APIRoute = async ({ site }) => {
  const domain = site?.origin || 'https://caproweb.com'
  const xml = await createSitemap(domain)

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}

async function createSitemap(domain: string) {
  const posts = listSortedFrontmatters().toArray()
  const postRoutes: Array<SitemapRoute> = posts.map((post) => ({
    url: `/contents/${post.slug}`,
    lastModified: formatDate(post.updatedAt ?? post.publishedAt),
    priority: 0.5,
  }))

  const sitemap = await generateSitemap({
    domain,
    routes: [{ url: '/', priority: 1.0 }, ...postRoutes],
  })

  return sitemap
}
