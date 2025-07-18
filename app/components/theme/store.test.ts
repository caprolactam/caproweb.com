import { describe, test, expect, vi, beforeEach } from 'vitest'
import { ThemeObserver } from './store.ts'

describe('ThemeObserver', () => {
  let observer: ThemeObserver

  beforeEach(() => {
    observer = new ThemeObserver()
  })

  describe('setTheme', () => {
    test('set theme, then resolvedTheme is light', () => {
      observer.setTheme('light')

      const { theme, resolvedTheme } = observer.getTheme()
      expect(theme).toBe('light')
      expect(resolvedTheme).toBe('light')
    })

    test('set theme, then resolvedTheme is dark', () => {
      observer.setTheme('dark')

      const { theme, resolvedTheme } = observer.getTheme()
      expect(theme).toBe('dark')
      expect(resolvedTheme).toBe('dark')
    })

    test.each(['light', 'dark'] as const)(
      'set theme to system, then resolvedTheme is systemTheme(%s)',
      (systemTheme) => {
        observer.setSystemTheme(systemTheme)
        observer.setTheme('system')

        const { theme, resolvedTheme } = observer.getTheme()
        expect(theme).toBe('system')
        expect(resolvedTheme).toBe(systemTheme)
      },
    )
  })

  describe('setSystemTheme', () => {
    test.each(['light', 'dark'] as const)(
      'update systemTheme(%s), then resolvedTheme is systemTheme if theme is system',
      (newSystemTheme) => {
        observer.setTheme('system')
        observer.setSystemTheme(newSystemTheme)

        const { resolvedTheme } = observer.getTheme()
        expect(resolvedTheme).toBe(newSystemTheme)
      },
    )

    test('update only systemTheme if theme is light', () => {
      observer.setTheme('light')
      observer.setSystemTheme('dark')

      const { theme, resolvedTheme } = observer.getTheme()
      expect(theme).toBe('light')
      expect(resolvedTheme).toBe('light')
    })

    test('update only systemTheme if theme is dark', () => {
      observer.setTheme('dark')
      observer.setSystemTheme('light')

      const { theme, resolvedTheme } = observer.getTheme()
      expect(theme).toBe('dark')
      expect(resolvedTheme).toBe('dark')
    })
  })

  describe('isTheme', () => {
    test('valid themes', () => {
      expect(ThemeObserver.isTheme('light')).toBe(true)
      expect(ThemeObserver.isTheme('dark')).toBe(true)
      expect(ThemeObserver.isTheme('system')).toBe(true)
    })
    test('invalid themes', () => {
      expect(ThemeObserver.isTheme('foo')).toBe(false)
      expect(ThemeObserver.isTheme('')).toBe(false)
    })
  })

  describe('onThemeChange', () => {
    test('emit listener when setTheme is called', () => {
      const listener = vi.fn()
      observer.onThemeChange(listener)
      observer.setTheme('dark')

      expect(listener).toHaveBeenCalled()
    })
    test('emit listener when setSystemTheme is called', () => {
      const listener = vi.fn()
      observer.onThemeChange(listener)
      observer.setSystemTheme('dark')

      expect(listener).toHaveBeenCalled()
    })
  })
})
