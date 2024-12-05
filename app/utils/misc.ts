import { clsx, type ClassValue } from 'clsx'
import React from 'react'
import { type LoaderFunction, type MetaFunction } from 'react-router'
import { extendTailwindMerge } from 'tailwind-merge'
import { extendedTheme } from './extended-theme.ts'

export const datetimeFormat = (date: Date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      ease: Object.keys(extendedTheme.transitionTimingFunction),
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}

// https://github.com/gregberge/react-merge-refs
// Copyright (c) 2020 Greg Bergé
export function mergeRefs<T = any>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>,
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }
}

// source: https://ribbit.konomi.app/blog/ts-strict-object-entries/
export const strictEntries = <T extends Record<string, any>>(
  object: T,
): [keyof T, T[keyof T]][] => {
  return Object.entries(object)
}

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

export function getDomainUrl(request: Request) {
  const host =
    request.headers.get('X-Forwarded-Host') ??
    request.headers.get('host') ??
    new URL(request.url).host
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

/**
 * code from: https://gist.github.com/ryanflorence/ec1849c6d690cfbffcb408ecd633e069
 * @example
 * export const meta: MetaFunction<typeof loader> = mergeMeta(({ data }) => [
  // data is now typed based on your loader
  { title: data.project.name },
  { name: "author", content: "Ryan Florence" }
])
 */
export const mergeMeta = <
  Loader extends LoaderFunction | unknown = unknown,
  ParentsLoaders extends Record<string, LoaderFunction | unknown> = Record<
    string,
    unknown
  >,
>(
  leafMetaFn: MetaFunction<Loader, ParentsLoaders>,
): MetaFunction<Loader, ParentsLoaders> => {
  return (arg) => {
    const leafMeta = leafMetaFn(arg)

    return arg.matches.reduceRight((acc, match) => {
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
    }, leafMeta ?? [])
  }
}
