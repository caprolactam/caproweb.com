import { useSyncExternalStore, useCallback } from 'react'

export function useMediaQuery(query: string, defaultMatches = false): boolean {
  const subscribe = useCallback(
    (callback: () => void): (() => void) => {
      const matchMedia = window.matchMedia(query)
      matchMedia.addEventListener('change', callback)

      return () => {
        matchMedia.removeEventListener('change', callback)
      }
    },
    [query],
  )

  function getSnapshot(): boolean {
    const matchMedia = window.matchMedia(query)
    return matchMedia.matches
  }

  const isMatched = useSyncExternalStore<boolean>(
    subscribe,
    getSnapshot,
    () => defaultMatches,
  )

  return isMatched
}

export function useIsMobile(defaultMatches = false) {
  return useMediaQuery('(max-width: 640px)', defaultMatches)
}
