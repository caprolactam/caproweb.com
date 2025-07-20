import { generateSitemap } from '@forge42/seo-tools/sitemap'
import type { SitemapRoute } from '@forge42/seo-tools/sitemap'
import type { APIRoute } from 'astro'
import { listSortedFrontmatters } from '@/lib/frontmatter.ts'
import { formatDate } from '@/lib/utils.ts'

export const GET: APIRoute = async ({ site }) => {
  const domain = site?.origin
  if (!domain) {
    throw new Error(
      'domain is not defined. Make sure to set the `site` option in your Astro config.',
    )
  }

  const xml = await createSitemap(domain)

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}

async function createSitemap(domain: string) {
  const staticRoutes: SitemapRoute[] = [
    {
      url: '/',
      priority: 1.0,
    },
  ]

  const posts = listSortedFrontmatters().toArray()
  const postRoutes = posts.map(
    (post) =>
      ({
        url: `/contents/${post.slug}`,
        lastmod: formatDate(post.updatedAt ?? post.publishedAt),
        priority: 0.5,
      }) satisfies SitemapRoute,
  )

  const sitemap = await generateSitemap({
    domain,
    routes: [...staticRoutes, ...postRoutes],
  })

  return sitemap
}
