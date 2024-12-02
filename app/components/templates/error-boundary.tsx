import type React from 'react'
import {
  type ErrorResponse,
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from 'react-router'
import { z } from 'zod'

const routeErrorSchema = z
  .object({
    data: z.object({
      message: z.string(),
    }),
  })
  .or(z.object({ data: z.string() }))

type StatusHandler = (info: {
  error: ErrorResponse
  params: Record<string, string | undefined>
}) => React.JSX.Element | string | null

export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => <p>{getErrorMessage(error)}</p>,
  statusHandlers,
  unexpectedErrorHandler = (error) => <p>{getErrorMessage(error)}</p>,
}: {
  defaultStatusHandler?: StatusHandler
  statusHandlers?: Record<number, StatusHandler>
  unexpectedErrorHandler?: (error: unknown) => React.JSX.Element | null
}) {
  const error = useRouteError()
  const params = useParams()

  if (typeof document === 'undefined') {
    console.error(error)
  }

  return (
    <div className='mb-24 mt-16 flex w-full grow items-center justify-center text-base md:mb-36 md:mt-24'>
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </div>
  )
}

export function getErrorMessage(error: unknown) {
  const result = routeErrorSchema.safeParse(error)

  if (!result.success) {
    return '私たちの側で問題が発生しました'
  }

  const { data } = result.data

  if (typeof data === 'string') return data
  if (typeof data.message === 'string') return data.message

  throw new Error('Unexpected error')
}
