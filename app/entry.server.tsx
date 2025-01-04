import { isbot } from 'isbot'
import { renderToReadableStream } from 'react-dom/server'
import {
  type AppLoadContext,
  type EntryContext,
  ServerRouter,
} from 'react-router'

const ABORT_DELAY = 5000

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  _loadContext: AppLoadContext,
) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), ABORT_DELAY)

  const body = await renderToReadableStream(
    <ServerRouter
      context={reactRouterContext}
      url={request.url}
    />,
    {
      signal: controller.signal,
      onError(error: unknown) {
        if (!controller.signal.aborted) {
          // Log streaming rendering errors from inside the shell
          console.error(error)
        }
        responseStatusCode = 500
      },
    },
  )

  void body.allReady.then(() => clearTimeout(timeoutId))

  if (isbot(request.headers.get('user-agent') || '')) {
    await body.allReady
  }

  responseHeaders.set('Content-Type', 'text/html')

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  })
}
