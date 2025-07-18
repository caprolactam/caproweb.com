import { monoRestrict } from 'mono-event'
import type { MonoRestrictedEvent } from 'mono-event'
import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = Extract<Theme, 'light' | 'dark'>

export type Store = {
  theme: Theme
  resolvedTheme: ResolvedTheme
}

export class ThemeObserver {
  private _store: Store
  private _systemTheme: ResolvedTheme

  readonly onThemeChange: MonoRestrictedEvent<Store>
  private readonly _emitThemeChange: (store: Store) => void

  readonly onSystemThemeChange: MonoRestrictedEvent<ResolvedTheme>
  private readonly _emitSystemThemeChange: (theme: ResolvedTheme) => void

  constructor(
    { defaultTheme }: { defaultTheme: Theme } = { defaultTheme: 'system' },
  ) {
    const systemTheme = defaultTheme === 'system' ? 'light' : defaultTheme

    this._store = {
      theme: defaultTheme,
      resolvedTheme: systemTheme,
    }
    this._systemTheme = systemTheme

    const { event: onThemeChange, emit: emitThemeChange } =
      monoRestrict<Store>()
    this.onThemeChange = onThemeChange
    this._emitThemeChange = emitThemeChange

    const { event: onSystemThemeChange, emit: emitSystemThemeChange } =
      monoRestrict<ResolvedTheme>()
    this.onSystemThemeChange = onSystemThemeChange
    this._emitSystemThemeChange = emitSystemThemeChange
  }

  public setTheme = (theme: Theme) => {
    this._store = {
      theme,
      resolvedTheme: theme === 'system' ? this._systemTheme : theme,
    }

    this._emitThemeChange(this._store)
  }

  public setSystemTheme = (theme: ResolvedTheme) => {
    this._systemTheme = theme
    this._emitSystemThemeChange(theme)

    this.setTheme(this._store.theme)
  }

  public getThemeSnapshot = () => {
    return this._store
  }

  static isTheme(theme: string): theme is Theme {
    return ['light', 'dark', 'system'].includes(theme)
  }
}

export const themeObserver = new ThemeObserver()
export const setTheme = themeObserver.setTheme
export const isTheme = ThemeObserver.isTheme

export function useTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function subscribe(callback: () => void): () => void {
  return themeObserver.onThemeChange.add(callback)
}

function getSnapshot() {
  return themeObserver.getThemeSnapshot()
}

const serverSnapshot: Store = {
  theme: 'system',
  resolvedTheme: 'light',
}
function getServerSnapshot() {
  return serverSnapshot
}
