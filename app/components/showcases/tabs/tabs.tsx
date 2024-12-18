'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import {
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
} from '@radix-ui/react-tabs'
import React from 'react'
import { cn, mergeRefs, set, useIsomorphicLayoutEffect } from '../utils/misc.ts'

const DURATION = 200
const EASE = [0.645, 0.045, 0.355, 1] // ease-in-out-cubic
const UNDERLINE_HEIGHT = 4

type TabsContextValue = {
  rootRef: React.RefObject<HTMLDivElement>
  listRef: React.RefObject<HTMLDivElement>
  hiddenListRef: React.RefObject<HTMLDivElement>
  item: (ref: React.RefObject<HTMLButtonElement>) => () => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

const useTabsContext = () => {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error('useTabsContext must be used within a TabsProvider')
  }
  return context
}

interface TabsProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
    'orientation'
  > {
  /**
   * The length of the active indicator.
   * @defaultValue 'tab'
   */
  indicatorSize?: 'text' | 'tab'
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(function Tabs(
  {
    children,
    value: valueProps,
    onValueChange,
    indicatorSize = 'tab',
    ...props
  },
  ref,
) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const hiddenListRef = React.useRef<HTMLDivElement>(null)
  const tabWidthRef = React.useRef(0)
  const visibleTabsRef = React.useRef<Set<React.RefObject<HTMLButtonElement>>>(
    new Set(),
  )
  const hiddenTabsRef = React.useRef<Set<React.RefObject<HTMLButtonElement>>>(
    new Set(),
  )

  const schedule = useScheduleLayoutEffect()

  /**
   * list valid tabs with sort
   */
  const listTabs = React.useCallback((list: 'visible' | 'hidden') => {
    if (
      !visibleTabsRef.current ||
      !hiddenTabsRef.current ||
      !listRef.current ||
      !hiddenListRef.current
    ) {
      return
    }

    const tabNodes = Array.from(
      list === 'visible'
        ? listRef.current.querySelectorAll('[demo-tab=""]')
        : hiddenListRef.current.querySelectorAll('[demo-tab=""]'),
    )
    const tabs = Array.from(
      list === 'visible' ? visibleTabsRef.current : hiddenTabsRef.current,
    )

    return tabs
      .map((tab) => tab.current)
      .filter(Boolean)
      .filter((tab) => tabNodes.includes(tab))
      .sort((a, b) => tabNodes.indexOf(a) - tabNodes.indexOf(b))
  }, [])

  /**
   * Do following actions, when the changes in the width of TabsList
   * such as resize or adding/removing tabs.
   * - Update th width of TabsList and TabsListHidden
   * - Adjust the position of the active indicator
   * - If the focused tab is outside TabsList viewport, scroll it into view
   */
  const adjustTabs = React.useCallback(async () => {
    const root = rootRef.current
    const list = listRef.current
    const hiddenList = hiddenListRef.current
    const visibleTabs = listTabs('visible')
    const hiddenTabs = listTabs('hidden')
    const tabsLength = visibleTabs?.length ?? 0

    if (
      !root ||
      !list ||
      !hiddenList ||
      !visibleTabs ||
      !hiddenTabs ||
      tabsLength === 0
    )
      return

    // TODO: feat: get min-width, min-inline-size, or flex-basis from styles
    // then, maxTabWidth = Math.max(minWidth, maxTabWidth)
    const initialContainerWidth = root.getBoundingClientRect().width
    let maxTabWidth = 0

    set(list, {
      width: 'auto',
    })
    visibleTabs.forEach((tab) => {
      set(tab, {
        width: 'auto',
        // TODO: fix: when flex-grow is 1, tab width is inconsistent every scripts. 🧐 Why?
        'flex-grow': '0',
      })

      const { width } = tab.getBoundingClientRect()
      maxTabWidth = Math.max(width, maxTabWidth)
    })

    const tempContainerWidth = maxTabWidth * tabsLength
    const containerWidth = Math.max(tempContainerWidth, initialContainerWidth)
    const tabWidth = containerWidth / tabsLength
    tabWidthRef.current = tabWidth

    visibleTabs.forEach((tab) => {
      set(tab, {
        width: `${tabWidth}px`,
        'flex-grow': undefined,
      })
    })
    hiddenTabs.forEach((tab) => {
      set(tab, {
        width: `${tabWidth}px`,
      })
    })

    set(list, {
      width: `${containerWidth}px`,
    })

    const selectedTab =
      visibleTabs.find((tab) => tab.getAttribute('data-state') === 'active') ??
      visibleTabs[0]! // tabsLength > 0, so validTabs[0] is not null
    const tabOrder = visibleTabs.indexOf(selectedTab)

    const endClipPath = getClipPath({
      targetOrder: tabOrder,
      targetWidth: tabWidthRef.current,
      target: selectedTab,
      indicatorSize,
    })
    // TODO: fix: 今回のアニメーションではwaapi使う必要ない
    const animation = hiddenList.animate(
      [
        {
          clipPath: endClipPath,
          width: `${containerWidth}px`,
        },
      ],
      { fill: 'forwards', duration: 0 },
    )
    await animation.finished
      .then(() => animation.commitStyles())
      .catch(() => {
        set(hiddenList, {
          clipPath: endClipPath,
          width: `${containerWidth}px`,
          transition: 'none',
        })
      })

    const activeElement = document.activeElement?.closest(
      '[demo-tabs=""] > [demo-tab=""]',
    ) as HTMLButtonElement | null

    const target = activeElement ?? selectedTab
    target.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'instant',
    })
  }, [indicatorSize, listTabs])

  useIsomorphicLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      entries.forEach(() => {
        void adjustTabs()
      })
    })
    if (!rootRef.current) return

    observer.observe(rootRef.current)
    return () => {
      observer.disconnect()
    }
  }, [adjustTabs, listTabs])

  const item = React.useCallback(
    (tab: React.RefObject<HTMLButtonElement>) => {
      if (tab.current?.closest('[demo-tabs-hidden=""]')) {
        hiddenTabsRef.current.add(tab)
        return () => {
          hiddenTabsRef.current.delete(tab)
        }
      }

      visibleTabsRef.current.add(tab)

      schedule(0, () => {
        void adjustTabs()
      })

      return () => {
        visibleTabsRef.current.delete(tab)

        schedule(0, () => {
          void adjustTabs()
        })
      }
    },
    [adjustTabs, schedule],
  )

  const context = React.useMemo<TabsContextValue>(
    () => ({
      rootRef,
      listRef,
      hiddenListRef,
      item,
    }),
    [item],
  )

  return (
    <TabsPrimitive.Root
      {...props}
      ref={mergeRefs([ref, rootRef])}
      demo-tabs-root=''
      className={cn('min-w-0', props.className)}
      orientation='horizontal'
      value={valueProps}
      onValueChange={async (v) => {
        onValueChange?.(v)

        /**
         * We have to do two things:
         * - Scroll the focused tab into view
         * - Update the indicator position to the selected tab.
         */
        if (!hiddenListRef.current) return

        const tabs = listTabs('visible')
        if (!tabs) return
        const selectedTab = tabs.find(
          (tab) => tab.getAttribute('data-value') === v,
        )
        if (!selectedTab) return
        const tabOrder = tabs.indexOf(selectedTab)

        selectedTab.scrollIntoView({
          inline: 'nearest',
          block: 'nearest',
          behavior: 'instant',
        })

        const endClipPath = getClipPath({
          targetOrder: tabOrder,
          targetWidth: tabWidthRef.current,
          target: selectedTab,
          indicatorSize,
        })
        const animation = hiddenListRef.current.animate(
          [
            {
              clipPath: endClipPath,
            },
          ],
          {
            duration: DURATION,
            easing: `cubic-bezier(${EASE.join(',')})`,
            fill: 'forwards',
          },
        )

        await animation.finished
          .then(() => animation.commitStyles())
          .catch(() => {
            set(hiddenListRef.current, {
              clipPath: endClipPath,
              transition: 'none',
            })
          })
      }}
    >
      <TabsContext.Provider value={context}>{children}</TabsContext.Provider>
    </TabsPrimitive.Root>
  )
})

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithRef<typeof TabsPrimitive.List>
>(function TabsList({ children, className, ...props }, ref) {
  const { listRef, hiddenListRef } = useTabsContext()

  return (
    <div className='relative overflow-x-auto pb-3'>
      <TabsPrimitive.List
        {...props}
        ref={mergeRefs([ref, listRef])}
        demo-tabs=''
        className={cn('border-brand-7', className, 'h-12 border-b')}
      >
        {children}
      </TabsPrimitive.List>
      <TabsPrimitive.List
        {...props}
        ref={hiddenListRef}
        demo-tabs-hidden=''
        className={cn(
          'bg-brand-add-text',
          className,
          'pointer-events-none absolute left-0 top-0 h-12 border-0',
        )}
        style={{
          clipPath: 'inset(0 100% 0 0)',
        }}
        aria-hidden
        tabIndex={-1}
      >
        {children}
      </TabsPrimitive.List>
    </div>
  )
})

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger(props, ref) {
  const { item } = useTabsContext()
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const cleanup = item(triggerRef)

    return cleanup
  }, [item])

  return (
    <TabsPrimitive.Trigger
      {...props}
      ref={mergeRefs([ref, triggerRef])}
      demo-tab=''
      data-value={props.value}
    />
  )
})

function getClipPath({
  targetOrder,
  targetWidth,
  target,
  indicatorSize,
}: {
  targetOrder: number
  targetWidth: number
  target: HTMLElement
  indicatorSize: TabsProps['indicatorSize']
}) {
  if (indicatorSize === 'text') {
    const textWidth = getTextWidth(target.innerText, getCanvasFont(target))
    const textToEdgeWidth = (targetWidth - textWidth) / 2
    const margin = 0.5
    return `inset(calc(100% - ${UNDERLINE_HEIGHT}px) calc(100% - ${(targetOrder + 1) * targetWidth - textToEdgeWidth + margin}px) 0 ${
      targetOrder * targetWidth + textToEdgeWidth - margin
    }px round 3px 3px 0 0)`
  }

  return `inset(calc(100% - ${UNDERLINE_HEIGHT}px) calc(100% - ${(targetOrder + 1) * targetWidth}px) 0 ${
    targetOrder * targetWidth
  }px round 3px 3px 0 0)`
}

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
function getTextWidth(text: string, font: string) {
  // re-use canvas object for better performance
  // @ts-ignore
  const canvas = (getTextWidth.canvas ||
    // @ts-ignore
    (getTextWidth.canvas =
      document.createElement('canvas'))) as HTMLCanvasElement
  const context = canvas.getContext('2d')
  if (!context) return 0
  context.font = font
  const metrics = context.measureText(text)
  return metrics.width
}

function getCssStyle(element: Element, prop: string) {
  return window.getComputedStyle(element, null).getPropertyValue(prop)
}

function getCanvasFont(el = document.body) {
  const fontWeight = getCssStyle(el, 'font-weight') || 'normal'
  const fontSize = getCssStyle(el, 'font-size') || '16px'
  const fontFamily =
    getCssStyle(el, 'font-family') ||
    '-apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", Meiryo, sans-serif'

  return `${fontWeight} ${fontSize} ${fontFamily}`
}

const useScheduleLayoutEffect = () => {
  const [s, ss] = React.useState<readonly []>()
  const fns = React.useRef<Map<string | number, () => void>>(
    new Map() as Map<string | number, () => void>,
  )

  useIsomorphicLayoutEffect(() => {
    fns.current.forEach((f) => f())
    fns.current = new Map() as Map<string | number, () => void>
  }, [s])

  return React.useCallback((id: string | number, cb: () => void) => {
    fns.current.set(id, cb)
    ss([])
  }, [])
}

const Root = Tabs
const Content = TabsPrimitive.Content
const Trigger = TabsTrigger
const List = TabsList

export { Root, List, Trigger, Content }
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps }
