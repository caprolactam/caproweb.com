import React from 'react'

let previousBodyPosition: Record<string, string> | null = null

export function usePositionFixed({
  isOpen,
  hasBeenOpened,
  preventScrollRestoration,
}: {
  isOpen: boolean
  hasBeenOpened: boolean
  preventScrollRestoration: boolean
}) {
  const [activeUrl, setActiveUrl] = React.useState(
    typeof window !== 'undefined' ? window.location.href : '',
  )
  const scrollPos = React.useRef(0)
  const aFPositionFixed = React.useRef<ReturnType<
    typeof requestAnimationFrame
  > | null>(null)
  const aFPositionRestore = React.useRef<ReturnType<
    typeof requestAnimationFrame
  > | null>(null)

  const setPositionFixed = React.useCallback(() => {
    // If previousBodyPosition is already set, don't set it again.
    if (previousBodyPosition === null && isOpen) {
      previousBodyPosition = {
        position: document.body.style.position,
        top: document.body.style.top,
        left: document.body.style.left,
        height: document.body.style.height,
      }
      // Update the dom inside an animation frame
      const { scrollX, innerHeight } = window
      document.body.style.setProperty('position', 'fixed', 'important')
      document.body.style.top = `${-scrollPos.current}px`
      document.body.style.left = `${-scrollX}px`
      document.body.style.right = '0px'
      document.body.style.height = 'auto'
      setTimeout(() => {
        aFPositionFixed.current = requestAnimationFrame(() => {
          // Attempt to check if the bottom bar appeared due to the position change
          const bottomBarHeight = innerHeight - window.innerHeight
          if (bottomBarHeight && scrollPos.current >= innerHeight) {
            // Move the content further up so that the bottom bar doesn't hide it
            document.body.style.top = `${-(scrollPos.current + bottomBarHeight)}px`
          }
        })
      }, 300)
    }
  }, [isOpen])

  const restorePositionSetting = React.useCallback(() => {
    if (previousBodyPosition !== null) {
      // Convert the position from "px" to Int
      const y = -parseInt(document.body.style.top, 10)
      const x = -parseInt(document.body.style.left, 10)
      // Restore styles
      previousBodyPosition.position &&
        (document.body.style.position = previousBodyPosition.position)
      previousBodyPosition.top &&
        (document.body.style.top = previousBodyPosition.top)
      previousBodyPosition.left &&
        (document.body.style.left = previousBodyPosition.left)
      previousBodyPosition.height &&
        (document.body.style.height = previousBodyPosition.height)
      document.body.style.right = 'unset'
      aFPositionRestore.current = requestAnimationFrame(() => {
        if (preventScrollRestoration && activeUrl !== window.location.href) {
          setActiveUrl(window.location.href)
          return
        }
        window.scrollTo(x, y)
      })
      previousBodyPosition = null
    }
  }, [activeUrl, preventScrollRestoration])

  React.useEffect(() => {
    function onScroll() {
      scrollPos.current = window.scrollY
    }

    onScroll()

    window.addEventListener('scroll', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  React.useEffect(() => {
    if (!hasBeenOpened) return
    // This is needed to force Safari toolbar to show **before** the drawer starts animating to prevent a gnarly shift from happening
    if (isOpen) {
      setPositionFixed()
    } else {
      restorePositionSetting()
    }

    return () => {
      if (aFPositionRestore.current) {
        cancelAnimationFrame(aFPositionRestore.current)
      }
      if (aFPositionFixed.current) {
        cancelAnimationFrame(aFPositionFixed.current)
      }
    }
  }, [
    isOpen,
    hasBeenOpened,
    activeUrl,
    setPositionFixed,
    restorePositionSetting,
  ])

  return { restorePositionSetting }
}
