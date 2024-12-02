import { Link, useMatches } from 'react-router'
import { z } from 'zod'
import { Icon } from '#app/components/parts/icon.tsx'

type BreadcrumbProps = {
  index: number
  lastIndex: boolean
  label: string
  to: string
}

function Breadcrumb({ index, lastIndex, label, to }: BreadcrumbProps) {
  const arrowIcon = index !== 0 && (
    <Icon
      name='navigate-next-thin'
      className='translate-x-0.5 text-brand-11'
      size={24}
    />
  )

  const baseBreadCrumb = (
    <>
      {arrowIcon}
      <Link
        to={to}
        className='anchor'
      >
        {label}
      </Link>
    </>
  )

  const lastBreadCrumb = (
    <>
      {arrowIcon}
      <span className='truncate'>{label}</span>
    </>
  )

  return lastIndex ? lastBreadCrumb : baseBreadCrumb
}

const BreadcrumbHandleMatch = z.object({
  handle: z.object({
    breadcrumb: z.union([
      z.string(),
      z.function().args(z.unknown()).returns(z.string()),
    ]),
  }),
})

export function BreadCrumbs() {
  const matches = useMatches()

  const breadcrumbs = matches
    .map((m) => {
      const result = BreadcrumbHandleMatch.safeParse(m)
      if (!result.success) return null

      const { breadcrumb } = result.data.handle
      const label =
        typeof breadcrumb === 'function' ? breadcrumb(m.data) : breadcrumb

      return {
        label,
        pathname: m.pathname,
        id: m.id,
      }
    })
    .filter(Boolean)

  return breadcrumbs.length > 0 ? (
    <nav
      aria-label='Breadcrumbs'
      className='text-sm'
    >
      <ol className='flex h-10 min-w-0 list-none overflow-hidden'>
        {breadcrumbs.map((match, index, arr) => (
          <li
            key={match.id}
            className='flex items-center'
          >
            <Breadcrumb
              index={index}
              lastIndex={index === arr.length - 1}
              label={match.label}
              to={match.pathname}
            />
          </li>
        ))}
      </ol>
    </nav>
  ) : null
}
