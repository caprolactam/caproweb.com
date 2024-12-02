import { type PlatformProxy } from 'wrangler'

type GetLoadContextArgs = {
  request: Request
  context: {
    cloudflare: Omit<PlatformProxy<Env>, 'dispose' | 'caches' | 'cf'> & {
      caches: PlatformProxy<Env>['caches'] | CacheStorage
      cf: Request['cf']
    }
  }
}

declare module 'react-router' {
  interface AppLoadContext extends ReturnType<typeof getLoadContext> {}

  interface LoaderFunctionArgs {
    context: AppLoadContext
  }

  // TODO: remove this once we've migrated to `Route.ActionArgs` instead for our actions
  interface ActionFunctionArgs {
    context: AppLoadContext
  }
}

export function getLoadContext({ context }: GetLoadContextArgs) {
  return context
}
