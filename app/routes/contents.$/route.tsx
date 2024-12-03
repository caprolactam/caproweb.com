import { runSync } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { data, type MetaDescriptor } from 'react-router'
import { serverOnly$ } from 'vite-env-only/macros'
import { Title } from '#app/components/parts/title.tsx'
import { GeneralErrorBoundary } from '#app/components/templates/error-boundary.tsx'
import { metadatasSchema } from '#app/utils/markdown.server.ts'
import { datetimeFormat } from '#app/utils/misc.ts'
import { type Route } from './+types/route'
import { validateSlug, getMdxSource } from './api.server.ts'

export const meta = ({ data, ...props }: Route.MetaArgs) => {
  // rr@7.0.2では、ここで分割代入しないと型が機能しない問題
  const { matches } = props
  const properties: MetaDescriptor[] = []

  if (data) {
    properties.push(
      {
        title: `${data.frontmatter.title} | Capro Web`,
      },
      {
        name: 'description',
        content: data.frontmatter.description,
      },
    )
  } else {
    properties.push({
      title: '存在しないページ | Capro Web',
    })
  }

  return matches.reduceRight((acc, match) => {
    if (match == null) return acc
    for (const parentMeta of match.meta) {
      const index = acc.findIndex(
        (meta) =>
          ('name' in meta &&
            'name' in parentMeta &&
            meta.name === parentMeta.name) ||
          ('property' in meta &&
            'property' in parentMeta &&
            meta.property === parentMeta.property) ||
          ('title' in meta && 'title' in parentMeta),
      )
      if (index === -1) {
        // Parent meta not found in acc, so add it
        acc.push(parentMeta)
      }
    }
    return acc
  }, properties)
}

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params['*']

  validateSlug(slug)

  const file = await getMdxSource(slug)

  if (!file) {
    throw data(
      {
        message: 'コンテンツが見つかりません',
      },
      {
        status: 404,
      },
    )
  }

  const { serializedMdx, frontmatter } = file

  return {
    serializedMdx,
    frontmatter,
  }
}

export const handle = {
  breadcrumb: (data: { frontmatter: { title: string } } | undefined) =>
    data ? data.frontmatter.title : '存在しないコンテンツ',
  getSitemapEntries: serverOnly$(async () => {
    const contents = await import('virtual:parse-markdown-frontmatter').then(
      ({ metadatas }) => {
        return metadatasSchema.parse(metadatas)
      },
    )

    return contents.map((content) => {
      return {
        route: `/contents/${content.filename}`,
        priority: 0.7,
        lastmod: datetimeFormat(content.updatedAt ?? content.createdAt),
      }
    })
  }),
}

export default function Route({
  loaderData: { serializedMdx, frontmatter },
}: Route.ComponentProps) {
  const { default: MDXContent } = runSync(serializedMdx, {
    ...runtime,
    // baseUrl: import.meta.url,
  })

  return (
    <div className='prose prose-brand mb-8 border-brand-6 prose-pre:border md:mb-36'>
      <Title
        title={frontmatter.title}
        keywords={frontmatter.keywords}
        createdAt={frontmatter.createdAt}
        updatedAt={frontmatter.updatedAt}
      />
      <MDXContent components={{}} />
    </div>
  )
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
