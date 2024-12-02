import { useEffect, useRef } from 'react'

export const debounce = <T extends () => void>(fn: T, ms: number) => {
  let id: ReturnType<typeof setTimeout> | undefined | null

  const cancel = () => {
    if (id != null) {
      clearTimeout(id)
    }
  }
  const debouncedFn = () => {
    cancel()
    id = setTimeout(() => {
      id = null
      fn()
    }, ms)
  }
  debouncedFn._cancel = cancel
  return debouncedFn
}

export type ScrollState = 'SCROLLING' | 'IDLE'

// code from: https://github.com/inokawa/virtua

export function useScrollEnd(fn: () => void) {
  const scrolling = useRef(false)
  const lastScrollTime = useRef(0)
  const wheeling = useRef(false)
  const touching = useRef(false)

  useEffect(() => {
    const onScrollEnd = debounce(() => {
      if (wheeling.current || touching.current) {
        wheeling.current = false

        // Wait while wheeling or touching
        onScrollEnd()
        return
      }

      fn()
      scrolling.current = false
    }, 150)

    const onScroll = () => {
      lastScrollTime.current = Date.now()

      if (!scrolling.current) {
        scrolling.current = true
      }
      onScrollEnd()
    }

    // Infer scroll state also from wheel events
    // Sometimes scroll events do not fire when frame dropped even if the visual have been already scrolled
    const onWheel = ((e: WheelEvent) => {
      if (
        wheeling.current ||
        // Scroll start should be detected with scroll event
        !scrolling.current ||
        // Probably a pinch-to-zoom gesture
        e.ctrlKey
      ) {
        return
      }

      const timeDelta = Date.now() - lastScrollTime.current
      if (
        // Check if wheel event occurs some time after scrolling
        timeDelta < 150 &&
        timeDelta > 50 &&
        // Get delta before checking deltaMode for firefox behavior
        // https://github.com/w3c/uievents/issues/181#issuecomment-392648065
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1392460#c34
        e.deltaY
      ) {
        wheeling.current = true
      }
    }) as (e: Event) => void

    const onTouchStart = () => {
      touching.current = true
    }
    const onTouchEnd = () => {
      touching.current = false
    }

    window.addEventListener('scroll', onScroll)
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      onScrollEnd._cancel()
    }
  }, [fn])
}
