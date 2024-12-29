import { strictEntries } from '#app/utils/misc.ts'
export {
  cn,
  mergeRefs,
  useIsomorphicLayoutEffect,
  strictEntries,
} from '#app/utils/misc.ts'
export { useHydrated } from '#app/utils/use-hydrated.ts'

export const clamp = (min: number, value: number, max: number) =>
  Math.min(Math.max(value, min), max)

interface Style {
  [key: string]: string | undefined
}

export function set(el?: Element | HTMLElement | null, styles?: Style) {
  if (!el || !(el instanceof HTMLElement) || !styles) return

  strictEntries(styles).forEach(([key, value]) => {
    key = key.toString()

    if (value === undefined) {
      el.style.removeProperty(key)
      return
    }

    if (key.startsWith('--')) {
      el.style.setProperty(key, value)
      return
    }

    ;(el.style as any)[key] = value
  })
}
