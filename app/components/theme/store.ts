import { useStore } from '@nanostores/react'
import { atom } from 'nanostores'
import type { PreinitializedWritableAtom } from 'nanostores'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = Extract<Theme, 'light' | 'dark'>
export type SystemTheme = Extract<Theme, 'light' | 'dark'>

export type Store = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  systemTheme: SystemTheme
}

export class ThemeObserver {
  private $store: PreinitializedWritableAtom<Store>
  onThemeChange: (listener: (store: Readonly<Store>) => void) => void

  constructor() {
    this.$store = atom<Store>({
      theme: 'system',
      resolvedTheme: 'light',
      systemTheme: 'light',
    })

    this.onThemeChange = this.$store.subscribe
  }

  public setTheme = (newTheme: Theme) => {
    const oldValue = this.$store.get()

    if (newTheme === 'system') {
      this.$store.set({
        ...oldValue,
        theme: 'system',
        resolvedTheme: oldValue.systemTheme,
      })
      return
    }

    this.$store.set({
      ...oldValue,
      theme: newTheme,
      resolvedTheme: newTheme,
    })
  }

  public setSystemTheme = (newSystemTheme: SystemTheme) => {
    const oldValue = this.$store.get()

    // If the current theme is 'system', update resolvedTheme to newSystemTheme
    if (oldValue.theme === 'system') {
      this.$store.set({
        ...oldValue,
        systemTheme: newSystemTheme,
        resolvedTheme: newSystemTheme,
      })
      return
    }

    this.$store.set({
      ...oldValue,
      systemTheme: newSystemTheme,
    })
  }

  public useTheme = () => {
    const store = useStore(this.$store)

    return {
      theme: store.theme,
      resolvedTheme: store.resolvedTheme,
    }
  }

  public getTheme = () => {
    const store = this.$store.get()

    return {
      theme: store.theme,
      resolvedTheme: store.resolvedTheme,
    }
  }

  static isTheme(theme: string): theme is Theme {
    return ['light', 'dark', 'system'].includes(theme)
  }
}

export const themeObserver = new ThemeObserver()

export const useTheme = themeObserver.useTheme
export const setTheme = themeObserver.setTheme
export const isTheme = ThemeObserver.isTheme
