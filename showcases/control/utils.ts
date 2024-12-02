// code from: https://usehooks-ts.com/react-hook/use-interval
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useIsomorphicLayoutEffect } from '../utils/misc.ts'

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  // Remember the latest callback if it changes.
  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (delay === null) {
      return
    }

    const id = setInterval(() => {
      savedCallback.current()
    }, delay)

    return () => {
      clearInterval(id)
    }
  }, [delay])
}

export function useIsDocumentHidden(defaultValue = false) {
  function subscribe(callback: () => void): () => void {
    document.addEventListener('visibilitychange', callback)
    return () => {
      document.removeEventListener('visibilitychange', callback)
    }
  }

  function getSnapshot(): boolean {
    return document.visibilityState === 'hidden'
  }

  const isDocumentHidden = useSyncExternalStore<boolean>(
    subscribe,
    getSnapshot,
    () => defaultValue,
  )
  return isDocumentHidden
}
