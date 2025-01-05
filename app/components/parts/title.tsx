import { AppBarTitle } from './app-bar.tsx'
import { FilterChipLink } from './filter-chip.tsx'

export function Title({
  title,
  createdAt,
  updatedAt: updatedAtProp,
  keywords,
}: {
  title: string
  keywords: string[]
  createdAt: Date
  updatedAt?: Date
}) {
  const updatedAt = updatedAtProp ?? createdAt
  const isUpdated = updatedAt.getTime() > createdAt.getTime()

  const timeFormat = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const datetimeFormat = (date: Date) =>
    `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`

  return (
    <div className='mb-8 grid gap-5'>
      <AppBarTitle
        title={title}
        asChild
      >
        <h1 className='mb-0'>{title}</h1>
      </AppBarTitle>
      <div className='flex gap-2 text-sm md:gap-3'>
        {isUpdated && (
          <span>
            最終更新日
            <time
              dateTime={datetimeFormat(updatedAt)}
              className='ml-1'
            >
              {timeFormat.format(updatedAt)}
            </time>
          </span>
        )}
        <span>
          投稿日
          <time
            dateTime={datetimeFormat(createdAt)}
            className='ml-1'
          >
            {timeFormat.format(createdAt)}
          </time>
        </span>
      </div>
      {keywords?.length ? (
        <ul className='not-prose flex flex-wrap gap-2 md:gap-3'>
          {keywords.sort().map((keyword) => (
            <li key={keyword}>
              <FilterChipLink
                to={{
                  pathname: '/contents',
                  search: new URLSearchParams({
                    keyword,
                  }).toString(),
                }}
              >
                {keyword}
              </FilterChipLink>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
