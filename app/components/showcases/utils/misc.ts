import { strictEntries } from '#app/utils/misc.ts'
export {
  cn,
  mergeRefs,
  useIsomorphicLayoutEffect,
  strictEntries,
} from '#app/utils/misc.ts'

export const clamp = (min: number, value: number, max: number) =>
  Math.min(Math.max(value, min), max)

interface Style {
  [key: string]: string | undefined
}

const cache = new WeakMap()

export function set(
  el?: Element | HTMLElement | null,
  styles?: Style,
  ignoreCache = false,
) {
  if (!el || !(el instanceof HTMLElement) || !styles) return
  const originalStyles: Style = {}

  strictEntries(styles).forEach(([key, value]) => {
    key = key.toString()
    if (value === undefined) {
      el.style.removeProperty(key)
      delete styles[key]
      return
    }

    if (key.startsWith('--')) {
      el.style.setProperty(key, value)
      return
    }

    originalStyles[key] = (el.style as any)[key]
    ;(el.style as any)[key] = value
    if (value === undefined) {
      el.style.removeProperty(key)
    }
  })

  if (ignoreCache) return

  cache.set(el, originalStyles)
}

export function reset(el: Element | HTMLElement | null, prop?: string) {
  if (!el || !(el instanceof HTMLElement)) return
  const originalStyles = cache.get(el)

  if (!originalStyles) {
    return
  }

  if (prop) {
    ;(el.style as any)[prop] = originalStyles[prop]
  } else {
    Object.entries(originalStyles).forEach(([key, value]) => {
      ;(el.style as any)[key] = value
    })
  }
}
