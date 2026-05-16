import { useMediaQuery } from './use-media-query.ts'

const MEDIA_QUERY = '(prefers-reduced-motion: no-preference)'

export function checkPrefersReducedMotion(): boolean {
  return !window.matchMedia(MEDIA_QUERY).matches
}

export function usePrefersReducedMotion(): boolean {
  return !useMediaQuery(MEDIA_QUERY, true)
}
