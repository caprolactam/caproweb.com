import { useEffect, useState, useCallback } from 'react'
import { ColorMode } from './types'

const STORAGE_KEY = 'color-mode'

const colorModeStorage = {
  get: () => {
    try {
      return window.localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  },
  set: (newColorMode: ColorMode) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, newColorMode)
    } catch {}
  },
}

export function useColorMode() {
  const [colorMode, setColorMode] = useState<ColorMode>(ColorMode.Light)

  useEffect(function initializeColorMode() {
    const initialColorMode = getColorModeFromDOM()

    setColorMode(initialColorMode)
    updateDOM(initialColorMode)
  }, [])

  useEffect(function watchColorModeUpdates() {
    const controller = new AbortController()

    window.addEventListener(
      'storage',
      (event) => {
        if (event.key !== STORAGE_KEY) return

        const newColorMode = isValidColorMode(event.newValue)
          ? event.newValue
          : getSystemColorMode()

        setColorMode(newColorMode)
        updateDOM(newColorMode)
      },
      { signal: controller.signal },
    )

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener(
      'change',
      () => {
        const shouldSync = !isValidColorMode(colorModeStorage.get())
        if (!shouldSync) return

        const newColorMode = getSystemColorMode()

        setColorMode(newColorMode)
        updateDOM(newColorMode)
      },
      { signal: controller.signal },
    )

    return () => {
      controller.abort()
    }
  }, [])

  const toggleColorMode = useCallback(() => {
    const newColorMode =
      colorMode === ColorMode.Dark ? ColorMode.Light : ColorMode.Dark

    setColorMode(newColorMode)
    updateDOM(newColorMode)
    colorModeStorage.set(newColorMode)
  }, [colorMode])

  return { colorMode, toggleColorMode }
}

function updateDOM(newColorMode: ColorMode) {
  const el = document.documentElement

  const cleanup = disableTransition()

  el.classList.remove(...Object.values(ColorMode))
  el.classList.add(newColorMode)
  el.dataset.colorMode = newColorMode
  el.style.colorScheme = newColorMode

  cleanup()
}

function disableTransition() {
  const css = document.createElement('style')
  css.appendChild(
    document.createTextNode(`*,*::before,*::after{transition:none!important}`),
  )
  document.head.appendChild(css)

  return function cleanup() {
    // Force restyle
    void window.getComputedStyle(document.body)

    // Wait for next tick before removing
    window.setTimeout(() => {
      document.head.removeChild(css)
    }, 1)
  }
}

function getSystemColorMode(): ColorMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? ColorMode.Dark
    : ColorMode.Light
}

function getColorModeFromDOM(): ColorMode {
  const colorMode = document.documentElement.dataset.colorMode

  return isValidColorMode(colorMode) ? colorMode : getSystemColorMode()
}

function isValidColorMode(
  colorMode: string | null | undefined,
): colorMode is ColorMode {
  return Object.values(ColorMode).includes(colorMode as ColorMode)
}
