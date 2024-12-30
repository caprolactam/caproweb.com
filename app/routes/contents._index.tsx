import { useSearchParams, useNavigate, useNavigation } from 'react-router'
import { AppBarTitle } from '#app/components/parts/app-bar.tsx'
import { FilterChip } from '#app/components/parts/filter-chip.tsx'
import { Icon } from '#app/components/parts/icon.tsx'
import { GeneralErrorBoundary } from '#app/components/templates/error-boundary.tsx'
import { ContentItem } from '#app/routes/_index.tsx'
import { metadataListSchema } from '#app/utils/markdown.server.ts'
// @ts-ignore This file won’t exist if it hasn’t yet been built
import metadata from '#app/utils/metadata/metadata.json'
import { mergeMeta, cn } from '#app/utils/misc.ts'
import { type Route } from './+types/contents._index'

export const meta = mergeMeta(() => [{ title: 'コンテンツ | Capro Web' }])

export async function loader({ request, context }: Route.LoaderArgs) {
  const contents = metadataListSchema
    .parse(metadata)
    .filter((content) =>
      context.cloudflare.env.ENVIRONMENT === 'production'
        ? !content.draft
        : true,
    )
  const { searchParams } = new URL(request.url)

  // Filter with keywords
  // 1. Get all keywords from query
  const queryKeywords = new Set(searchParams.getAll('keyword'))
  // 2. Get all keywords from contents
  const allKeywords: Set<string> = new Set()
  contents.forEach((content) => {
    content.keywords?.forEach((keyword) => {
      allKeywords.add(keyword)
    })
  })
  // 3. Filter contents by keywords
  const filteredKeywords = new Set(
    [...queryKeywords].filter((keyword) => allKeywords.has(keyword)),
  )
  const filteredContents = contents
    .filter((content) => {
      return [...filteredKeywords].every((keyword) =>
        content.keywords?.includes(keyword),
      )
    })
    .sort((a, b) => {
      // sort by updatedAt(desc), tittle(asc)
      const aTime = (a.updatedAt ?? a.createdAt).getTime()
      const bTime = (b.updatedAt ?? b.createdAt).getTime()
      return aTime > bTime ? -1 : aTime === bTime ? 0 : 1
    })
  // 4. Get selectable keywords from filtered contents
  const selectableKeywords: Set<string> = new Set()
  filteredContents.forEach((content) => {
    content.keywords?.forEach((keyword) => {
      selectableKeywords.add(keyword)
    })
  })

  // TODO: Pagination with offset(currently display all contents.)

  return {
    contents: filteredContents,
    totalContents: contents.length,
    allKeywords: [...allKeywords].sort(),
    selectableKeywords: [...selectableKeywords],
  }
}

export default function Route({
  loaderData: { contents, allKeywords, selectableKeywords },
}: Route.ComponentProps) {
  const [searchParams] = useSearchParams()

  const filteredKeywords = useOptimisticFilteredKeywords()
  const navigate = useNavigate()

  const selectedCount = allKeywords.reduce((acc, keyword) => {
    if (filteredKeywords.has(keyword)) {
      return acc + 1
    }
    return acc
  }, 0)

  return (
    <>
      <AppBarTitle
        title='コンテンツ'
        asChild
      >
        <h1 className='mb-4 text-2xl font-bold md:mb-6'>コンテンツ</h1>
      </AppBarTitle>
      {contents.length === 0 ? null : (
        <div className='mb-4 md:mb-6'>
          <span className='sr-only'>キーワードで絞り込む</span>
          <ul className='flex flex-wrap gap-2 md:gap-3'>
            {allKeywords.map((keyword) => (
              <li key={keyword}>
                <FilterChip
                  value={keyword}
                  selected={filteredKeywords.has(keyword)}
                  disabled={!selectableKeywords.includes(keyword)}
                  onSelect={(checked) => {
                    const submissionKeywords = new Set(filteredKeywords)
                    if (checked) {
                      submissionKeywords.add(keyword)
                    } else {
                      submissionKeywords.delete(keyword)
                    }

                    void navigate({
                      search: setSearchParamsString(searchParams, {
                        keyword: submissionKeywords,
                      }),
                    })
                  }}
                >
                  {keyword}
                </FilterChip>
              </li>
            ))}
            <li>
              <button
                type='button'
                onClick={() => {
                  void navigate({
                    search: setSearchParamsString(searchParams, {
                      keyword: undefined,
                    }),
                  })
                }}
                disabled={selectedCount === 0}
                className={cn(
                  'relative inline-flex h-8 select-none appearance-none items-center rounded-lg border border-brand-7 pl-2 pr-4 text-xs font-medium text-brand-12 hover:bg-brand-4 active:bg-brand-5',
                  'disabled:pointer-events-none disabled:border-brand-12/12 disabled:bg-brand-12/12 disabled:text-brand-12/38',
                  'before:absolute before:inset-x-0 before:inset-y-1/2 before:h-10 before:-translate-y-1/2',
                )}
              >
                <Icon
                  name='close'
                  size={18}
                />
                <span className='pl-2'>すべてクリア</span>
              </button>
            </li>
          </ul>
        </div>
      )}
      <ul>
        {contents.map((content) => (
          <li key={content.fileNameWithoutExt}>
            <ContentItem
              url={`/contents/${content.fileNameWithoutExt}`}
              title={content.title}
              description={content.description}
              keywords={content.keywords}
              isExternal={false}
              heading='h2'
            />
          </li>
        ))}
      </ul>
    </>
  )
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}

function useOptimisticFilteredKeywords(): Set<string | number> {
  const [searchParams] = useSearchParams()
  const { location } = useNavigation()

  if (location != null) {
    const optimisticSearchParams = new URLSearchParams(location.search)
    return new Set(optimisticSearchParams.getAll('keyword'))
  }

  return new Set(searchParams.getAll('keyword'))
}

function setSearchParamsString(
  searchParams: URLSearchParams,
  changes: Record<string, Set<string | number> | undefined>,
) {
  const newSearchParams = new URLSearchParams(searchParams)

  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) {
      newSearchParams.delete(key)
      continue
    }

    newSearchParams.delete(key)

    value.forEach((change) => {
      newSearchParams.append(key, String(change))
    })
  }
  // Print string manually to avoid over-encoding the URL
  // Browsers are ok with $ nowadays
  // optional: return newSearchParams.toString()
  return Array.from(newSearchParams.entries())
    .map(([key, value]) =>
      value ? `${key}=${encodeURIComponent(value)}` : key,
    )
    .join('&')
}
