import { data } from 'react-router'
import { GeneralErrorBoundary } from '#app/components/templates/error-boundary.tsx'
import { mergeMeta } from '#app/utils/misc.ts'
import { type Route } from './+types/$'

export const handle = {
  breadcrumb: '存在しないページ',
  getSitemapEntries: () => null,
}

export const meta = mergeMeta(() => [{ title: '存在しないページ | Capro Web' }])

export async function loader({}: Route.LoaderArgs) {
  throw data('ページが見つかりません', {
    status: 404,
  })
}

export default function Route() {
  return <ErrorBoundary />
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
