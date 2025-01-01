'use client'

import {
  Root,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Trigger,
  Close,
} from '@radix-ui/react-dialog'
import { Slot, Slottable } from '@radix-ui/react-slot'
import React from 'react'
import { mergeRefs } from '../utils/misc.ts'
import { cubicBezier } from './cubic-bezier.ts'
import { set, reset } from './helpers'
import { useControllableState } from './use-controllable-state'
import { usePreventScroll, isInput } from './use-prevent-scroll'

import './styles.css'

const WINDOW_TOP_OFFSET = 26

type SearchContextValue = {
  searchRef: React.RefObject<HTMLDivElement | null>
  searchBarRef: React.RefObject<HTMLDivElement | null>
  calculateAnimationPosition: (type: 'enter' | 'exit') => () => void
  isPlayingAnimation: React.RefObject<boolean>
}

const SearchContext = React.createContext<SearchContextValue | undefined>(
  undefined,
)

const useSearchContext = () => {
  const context = React.use(SearchContext)
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchContext')
  }
  return context
}

let styleElement: HTMLStyleElement | null

interface SearchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Root>, 'modal'> {}

function Search({
  children,
  open: openProp,
  onOpenChange,
  defaultOpen,
}: SearchProps) {
  const [isOpen = false, setIsOpen] = useControllableState({
    defaultProp: defaultOpen,
    prop: openProp,
    onChange: (o: boolean) => {
      if (searchBarRef.current) {
        searchBarRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        })
      }

      onOpenChange?.(o)

      if (o) {
        set(searchBarRef.current, {
          opacity: '0',
        })
      }
    },
  })
  const [hasBeenOpened, setHasBeenOpened] = React.useState<boolean>(false)

  const searchRef = React.useRef<HTMLDivElement>(null)
  const searchBarRef = React.useRef<HTMLDivElement>(null)

  const isPlayingAnimation = React.useRef<boolean>(false)
  const resizeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const keyboardIsOpen = React.useRef(false)
  const previousDiffFromInitial = React.useRef(0)
  const initialSearchHeight = React.useRef(0)

  usePreventScroll({
    isDisabled: !isOpen || !hasBeenOpened,
  })

  const calculateAnimationPosition = React.useCallback(
    (type: 'enter' | 'exit') => {
      if (!styleElement) {
        styleElement = document.createElement('style')
        document.head.appendChild(styleElement)
      }

      const searchBar = searchBarRef.current
      const searchContent = searchRef.current

      if (!searchBar || !searchContent) return () => {}

      const {
        left: searchBarLeft,
        top: searchBarTop,
        width: searchBarWidth,
        height: searchBarHeight,
      } = searchBar.getBoundingClientRect()
      const {
        left: searchContentLeft,
        top: searchContentTop,
        width: searchContentWidth,
        height: searchContentHeight,
      } = searchContent.getBoundingClientRect()

      const fromTranslateX = searchBarLeft - searchContentLeft
      const fromTranslateY = searchBarTop - searchContentTop
      const fromScaleX = searchBarWidth / searchContentWidth
      const fromScaleY = searchBarHeight / searchContentHeight

      let contentAnimation = ''
      let inverseAnimation = ''

      const easeOut = cubicBezier(0.32, 0.72, 0, 1)

      for (let step = 0; step <= 100; step += 5) {
        const easedStep = easeOut(step / 100)

        let translateX: number,
          translateY: number,
          scaleX: number,
          scaleY: number

        if (type === 'enter') {
          translateX = fromTranslateX - fromTranslateX * easedStep
          translateY = fromTranslateY - fromTranslateY * easedStep
          scaleX = fromScaleX + (1 - fromScaleX) * easedStep
          scaleY = fromScaleY + (1 - fromScaleY) * easedStep
        } else {
          translateX = fromTranslateX * easedStep
          translateY = fromTranslateY * easedStep
          scaleX = 1 + (fromScaleX - 1) * easedStep
          scaleY = 1 + (fromScaleY - 1) * easedStep
        }

        contentAnimation += `${step}% {
          transform: translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0) scale3d(${scaleX.toFixed(2)}, ${scaleY.toFixed(2)}, 1);
      }`

        // And now the inverse for the contents.
        const inverseScaleX = 1 / scaleX
        const inverseScaleY = 1 / scaleY
        inverseAnimation += `${step}% {
          transform: scale3d(${inverseScaleX.toFixed(2)}, ${inverseScaleY.toFixed(2)}, 1);
      }`
      }

      styleElement.textContent = `
      @keyframes ${type === 'enter' ? `expandSearch` : `collapseSearch`} {
        ${contentAnimation}
      }
      @keyframes ${type === 'enter' ? `expandSearchInner` : `collapseSearchInner`} {
        ${inverseAnimation}
      }
    `

      return () => {
        styleElement?.remove()
        styleElement = null
      }
    },
    [],
  )

  React.useEffect(() => {
    function onVisualViewportChange() {
      // Search Contentの開閉アニメーションにtransform: scale()を用いているため、styleの計算がおかしくなる。
      // アニメーション動作時はresizeイベントの実行を遅延させる
      if (!isPlayingAnimation.current) {
        resizeTimeoutRef.current && clearTimeout(resizeTimeoutRef.current)
        resizeTimeoutRef.current = setTimeout(() => {
          onVisualViewportChange()
        }, 100)
        return
      }

      if (!searchRef.current) return

      const focusedElement = document.activeElement as HTMLElement
      if (isInput(focusedElement) || keyboardIsOpen.current) {
        const visualViewportHeight = window.visualViewport?.height || 0
        const totalHeight = window.innerHeight
        // This is the height of the keyboard
        let diffFromInitial = totalHeight - visualViewportHeight

        set(searchRef.current, {
          height: 'auto',
        })
        const drawerHeight =
          searchRef.current.getBoundingClientRect().height || 0
        // Adjust drawer height only if it's tall enough
        const isTallEnough = drawerHeight > totalHeight * 0.8

        // if (!initialSearchHeight.current) { // Why only set initialSearchHeight.current is falsy?
        initialSearchHeight.current = drawerHeight
        // }
        const offsetFromTop = searchRef.current.getBoundingClientRect().top

        // visualViewport height may change due to somq e subtle changes to the keyboard. Checking if the height changed by 60 or more will make sure that they keyboard really changed its open state.
        if (Math.abs(previousDiffFromInitial.current - diffFromInitial) > 60) {
          keyboardIsOpen.current = !keyboardIsOpen.current
        }

        previousDiffFromInitial.current = diffFromInitial
        // We don't have to change the height if the input is in view, when we are here we are in the opened keyboard state so we can correctly check if the input is in view
        if (drawerHeight > visualViewportHeight || keyboardIsOpen.current) {
          const height = searchRef.current.getBoundingClientRect().height
          let newDrawerHeight = height

          if (height > visualViewportHeight) {
            newDrawerHeight =
              visualViewportHeight -
              (isTallEnough ? offsetFromTop : WINDOW_TOP_OFFSET)
          }
          searchRef.current.style.height = `${Math.max(newDrawerHeight, visualViewportHeight - offsetFromTop)}px`
        } else if (
          // Does not broken at least using this component on android Firefox. so just disable only on iOS Firefox.
          // !isMobileFirefox()
          !/FxiOS/.test(navigator.userAgent)
        ) {
          searchRef.current.style.height = `${initialSearchHeight.current}px`
        }

        // Nomally, we should uncomment this line, but SearchContent is full screen(fixed + inset-0).
        // so setting bottom position is useless.
        // https://github.com/emilkowalski/vaul/issues/461
        // searchRef.current.style.bottom = `${Math.max(diffFromInitial, 0)}px`
      }
    }

    const resizeTimeout = resizeTimeoutRef.current
    window.visualViewport?.addEventListener('resize', onVisualViewportChange)

    return () => {
      window.visualViewport?.removeEventListener(
        'resize',
        onVisualViewportChange,
      )
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
  }, [])

  React.useEffect(() => {
    // As you know, this is "You might not need an effect" pattern 😅.
    // However, we sometimes want to close dialog (and do exit animation) without using `<Close />` button.
    if (!isOpen) {
      calculateAnimationPosition('exit')
      setTimeout(() => {
        set(searchRef.current, {
          display: 'none',
        })
        reset(searchBarRef.current)
      }, 500)
    }
  }, [isOpen, calculateAnimationPosition])

  return (
    <Root
      modal
      open={isOpen}
      onOpenChange={(o) => {
        if (o) {
          setHasBeenOpened(true)
        }

        setIsOpen(o)
      }}
    >
      <SearchContext
        value={{
          searchRef,
          searchBarRef,
          calculateAnimationPosition,
          isPlayingAnimation,
        }}
      >
        {children}
      </SearchContext>
    </Root>
  )
}

interface SearchOverlayProps
  extends React.ComponentPropsWithRef<typeof Overlay> {}
function SearchOverlay({ ref, ...props }: SearchOverlayProps) {
  return (
    <Overlay
      ref={ref}
      data-search-overlay=''
      {...props}
    />
  )
}

interface SearchContentProps
  extends React.ComponentPropsWithRef<typeof Content> {}

function SearchContent({
  children,
  ref,
  onAnimationStart,
  onAnimationEnd,
  onEscapeKeyDown,
  onPointerDownOutside,
  onInteractOutside,
  ...props
}: SearchContentProps) {
  const { searchRef, calculateAnimationPosition, isPlayingAnimation } =
    useSearchContext()

  const [delayedAnimation, setDelayedAnimation] = React.useState(false)

  React.useEffect(() => {
    const cleanup = calculateAnimationPosition('enter')
    return cleanup
  }, [calculateAnimationPosition])

  React.useEffect(() => {
    // trigger enter animation
    window.requestAnimationFrame(() => {
      setDelayedAnimation(true)
    })
  }, [])

  return (
    <Content
      data-search-content=''
      data-delayed-animation={delayedAnimation ? 'true' : 'false'}
      ref={mergeRefs([ref, searchRef])}
      {...props}
      onAnimationStart={(e) => {
        if (e.target === searchRef.current) {
          isPlayingAnimation.current = false
        }

        onAnimationStart?.(e)
      }}
      onAnimationEnd={(e) => {
        if (e.target === searchRef.current) {
          isPlayingAnimation.current = true
        }

        onAnimationEnd?.(e)
      }}
      // Bottom codes are workaround of a animation problem during enter / exit animation.
      onEscapeKeyDown={(e) => {
        onEscapeKeyDown?.(e)

        if (!isPlayingAnimation.current && !e.defaultPrevented) {
          e.preventDefault()
        }
      }}
      onPointerDownOutside={(e) => {
        onPointerDownOutside?.(e)

        if (!isPlayingAnimation.current && !e.defaultPrevented) {
          e.preventDefault()
        }
      }}
      onInteractOutside={(e) => {
        onInteractOutside?.(e)

        if (!isPlayingAnimation.current && !e.defaultPrevented) {
          e.preventDefault()
        }
      }}
    >
      <div data-search-content-inner=''>
        <Slottable>{children}</Slottable>
      </div>
    </Content>
  )
}

interface SearchBarProps extends React.ComponentPropsWithRef<typeof Slot> {
  asChild?: boolean
}

function SearchBar({
  asChild = false,
  children,
  ref,
  ...props
}: SearchBarProps) {
  const { searchBarRef } = useSearchContext()

  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      {...props}
      data-search-bar=''
      ref={mergeRefs([ref, searchBarRef])}
    >
      {children}
    </Comp>
  )
}

const Bar = SearchBar

export {
  Search as Root,
  Portal,
  SearchOverlay as Overlay,
  SearchContent as Content,
  Title,
  Description,
  Bar,
  Trigger,
  Close,
}
