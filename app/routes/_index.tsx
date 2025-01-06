import { Link as RemixLink } from 'react-router'
import { AppBarTitle } from '#app/components/parts/app-bar.tsx'
import { IconLink } from '#app/components/parts/icon-button.tsx'
import { Icon } from '#app/components/parts/icon.tsx'
import { GeneralErrorBoundary } from '#app/components/templates/error-boundary.tsx'
import { metadataListSchema } from '#app/utils/markdown.server.ts'
// @ts-ignore This file won’t exist if it hasn’t yet been built
import metadata from '#app/utils/metadata/metadata.json'
import { cn } from '#app/utils/misc.ts'
import { type Route } from './+types/_index'

export async function loader() {
  const recentContents = metadataListSchema.parse(metadata)

  const contents = recentContents
    .filter((file) => !file.draft)
    .sort((a, b) => {
      const aTime = (a.updatedAt ?? a.createdAt).getTime()
      const bTime = (b.updatedAt ?? b.createdAt).getTime()
      return aTime > bTime ? -1 : aTime === bTime ? 0 : 1
    })
    .slice(0, 4)

  return {
    contents,
    totalContents: contents.length,
  }
}

type Item = {
  title: string
  description: string
  url: string
}

const propjects: Array<Item> = [
  {
    title: 'feed-a11y',
    description: 'React component implementing APG Feed pattern.',
    url: 'https://github.com/caprolactam/feed-a11y',
  },
]

export default function Index({
  loaderData: { contents, totalContents },
}: Route.ComponentProps) {
  return (
    <>
      <AppBarTitle
        title='ホーム'
        asChild
      >
        <h1 className='mb-4 text-2xl font-bold md:mb-6'>ホーム</h1>
      </AppBarTitle>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6'>
        <List
          title='コンテンツ'
          description={`${totalContents}件の投稿`}
          link={
            <IconLink
              size='lg'
              label='すべて表示'
              to='/contents'
              variant='ghost'
            >
              <Icon
                className='translate-x-0.5'
                name='chevron-right'
                size={24}
              />
            </IconLink>
          }
        >
          <ul>
            {contents.map((content) => (
              <li key={content.fileNameWithoutExt}>
                <ContentItem
                  url={`/contents/${content.fileNameWithoutExt}`}
                  title={content.title}
                  description={content.description}
                  keywords={content.keywords}
                  isExternal={false}
                />
              </li>
            ))}
          </ul>
        </List>
        <List title='プロジェクト'>
          <ul>
            {propjects.map((propject) => (
              <li key={propject.url}>
                <ContentItem
                  key={propject.url}
                  url={propject.url}
                  title={propject.title}
                  description={propject.description}
                  keywords={['project']}
                  isExternal
                />
              </li>
            ))}
          </ul>
        </List>
      </div>
    </>
  )
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}

function List({
  children,
  className,
  title,
  description,
  link,
}: {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  link?: React.ReactNode
}) {
  return (
    <div className={cn('size-full rounded-lg bg-brand-3 p-4', className)}>
      <div className='grid h-12 grid-flow-col grid-rows-[repeat(2,_auto)]'>
        {description ? (
          <span className='block text-sm text-brand-11'>{description}</span>
        ) : null}
        {title ? <h2 className='text-lg font-bold'>{title}</h2> : null}
        {link ? (
          <div className='row-span-2 justify-self-end'>{link}</div>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function ContentItem({
  title,
  description,
  url,
  keywords,
  isExternal = true,
  heading: Heading = 'h3',
}: Item & { keywords: string[]; isExternal?: boolean; heading?: 'h2' | 'h3' }) {
  function Link({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) {
    return isExternal ? (
      <a
        className={className}
        href={url}
      >
        {children}
      </a>
    ) : (
      <RemixLink
        className={className}
        to={url}
      >
        {children}
      </RemixLink>
    )
  }

  return (
    <Link className='group relative grid h-14 grid-flow-col grid-rows-[repeat(2,_auto)] content-center justify-start gap-x-2'>
      <div className='row-span-2 flex size-10 items-center justify-center self-center rounded-sm'>
        <ContentItemIcon keywords={keywords} />
      </div>
      <Heading className='truncate text-base font-medium underline-offset-2 group-hover:underline'>
        {title}
      </Heading>
      <p className='w-full truncate text-sm text-brand-11'>{description}</p>
      {isExternal && (
        <div className='inline-flex items-center text-brand-11'>
          <Icon
            name='open-in-new'
            size={20}
          />
        </div>
      )}
    </Link>
  )
}

function ContentItemIcon({ keywords }: { keywords: Array<string> }) {
  if (keywords.includes('project')) {
    return (
      <Icon
        name='design-services-thin'
        className='text-brand-12'
        size={32}
      />
    )
  }

  if (keywords.includes('animation')) {
    return (
      <Icon
        name='animation'
        className='text-brand-12'
        size={32}
      />
    )
  }

  return (
    <Icon
      name='article'
      className='text-brand-12'
      size={32}
    />
  )
}
