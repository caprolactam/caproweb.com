'use client'

import { Slot } from '@radix-ui/react-slot'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { type TabsListProps, type TabsContentProps } from '@radix-ui/react-tabs'
import React from 'react'
import { mergeRefs, set, useIsomorphicLayoutEffect } from '../utils/misc.ts'
import { DEFAULT_DURATION, DEFAULT_EASE } from './base.tsx'

type TabsContextValue = {
  rootRef: React.RefObject<HTMLDivElement>
  listRef: React.RefObject<HTMLDivElement>
  hiddenListRef: React.RefObject<HTMLDivElement>
  itemTab: (triggerRef: React.RefObject<HTMLButtonElement>) => () => void
  itemIndicator: (indicatorRef: React.RefObject<HTMLDivElement>) => () => void
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
   * The duration ms of the active indicator animation.
   * @defaultValue 200
   */
  duration?: number
  /**
   * Transition timing of the active indicator animation.
   */
  easing?: string
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(function Tabs(
  {
    children,
    value: valueProps,
    onValueChange,
    duration = DEFAULT_DURATION,
    easing = `cubic-bezier(${DEFAULT_EASE.join(',')})`,
    ...props
  },
  ref,
) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const hiddenListRef = React.useRef<HTMLDivElement>(null)
  const tabsRef = React.useRef<Set<React.RefObject<HTMLButtonElement>>>(
    new Set(),
  )
  const indicatorsRef = React.useRef<Set<React.RefObject<HTMLDivElement>>>(
    new Set(),
  )
  const schedule = useScheduleLayoutEffect()

  const listTabs = React.useCallback(() => {
    if (!tabsRef.current || !listRef.current) {
      return
    }

    const tabsNodes = Array.from(
      listRef.current.querySelectorAll('[demo-tab=""]'),
    )
    const tabsSet = Array.from(tabsRef.current)

    return tabsSet
      .map((tab) => tab.current)
      .filter(Boolean)
      .filter((tab) => tabsNodes.includes(tab))
      .sort((a, b) => tabsNodes.indexOf(a) - tabsNodes.indexOf(b))
  }, [])

  const moveActiveIndicator = React.useCallback(
    ({
      previousTab,
      nextTab,
      instant = false,
    }: {
      previousTab?: HTMLButtonElement | undefined
      nextTab: HTMLButtonElement | undefined
      instant?: boolean
    }) => {
      const list = listRef.current
      const hiddenList = hiddenListRef.current

      const keyframeOption = (
        instant
          ? {
              fill: 'forwards',
              duration: 0,
            }
          : {
              fill: 'forwards',
              duration,
              easing,
            }
      ) satisfies KeyframeAnimationOptions

      const prevIndicator = getFirstIndicator(previousTab)
      const nextIndicator = getFirstIndicator(nextTab)

      if (!list || !hiddenList || !nextIndicator) return

      const {
        left: listLeft,
        top: listTop,
        height: listHeight,
      } = list.getBoundingClientRect()
      const {
        left: indicatorLeft,
        width,
        top: indicatorTop,
        height: indicatorHeight,
      } = nextIndicator.getBoundingClientRect()
      const { borderRadius } = window.getComputedStyle(nextIndicator)
      const { clipPath: currentClipPath } = window.getComputedStyle(hiddenList)
      const toPos = indicatorLeft - listLeft
      const top = indicatorTop - listTop
      const bottom = listHeight - (top + indicatorHeight)

      const nextClipPath = `inset(${top}px calc(100% - ${toPos + width}px) ${bottom}px ${toPos}px round ${borderRadius})`
      hiddenList.getAnimations().forEach((animation) => {
        animation.cancel()
      })

      if (!previousTab || !prevIndicator) {
        set(hiddenList, {
          clipPath: nextClipPath,
          transitionDuration: '0s',
        })

        hiddenList.animate(
          {
            opacity: [0, 1],
          },
          keyframeOption,
        )
        return
      }

      hiddenList.animate(
        [
          {
            clipPath: currentClipPath,
          },
          {
            clipPath: nextClipPath,
          },
        ],
        keyframeOption,
      )

      function getFirstIndicator(trigger: HTMLElement | undefined) {
        if (!trigger) return

        const indicatorNodes = Array.from(
          trigger.querySelectorAll('[demo-tab-indicator=""]'),
        )
        const indicatorsSet = Array.from(indicatorsRef.current)

        return indicatorsSet
          .map((indicatorRef) => indicatorRef.current)
          .filter(Boolean)
          .find((indicator) =>
            indicatorNodes.some((node) => node === indicator),
          )
      }
    },
    [duration, easing],
  )

  const adjustTabs = React.useCallback(() => {
    // hide indicators after hydration
    const indicators = Array.from(indicatorsRef.current)
      .map((indicator) => indicator.current)
      .filter(Boolean)

    indicators.forEach((indicator) => {
      set(indicator, {
        opacity: '0',
      })
    })

    /**
     * If focued element is the tab or inside it, then scroll it.
     * If not, then scroll the active tab
     */
    const focusedTab = document.activeElement?.closest(
      '[demo-tabs=""] > [demo-tab=""]',
    ) as HTMLButtonElement | null

    const tabs = listTabs()
    const activeTab = tabs?.find(
      (tab) => tab.getAttribute('data-state') === 'active',
    )
    // TODO: it is annoys me by force scrolling, so improve it
    // focusedTab ??
    //   activeTab?.scrollIntoView({
    //     block: 'nearest',
    //     inline: 'nearest',
    //     behavior: 'instant',
    //   })

    moveActiveIndicator({
      nextTab: activeTab,
      instant: true,
    })
  }, [listTabs, moveActiveIndicator])

  useIsomorphicLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      entries.forEach(() => {
        adjustTabs()
      })
    })
    if (!rootRef.current) return

    observer.observe(rootRef.current)
    return () => {
      observer.disconnect()
    }
  }, [adjustTabs])

  const itemTab = React.useCallback(
    (tabRef: React.RefObject<HTMLButtonElement>) => {
      tabsRef.current.add(tabRef)
      schedule(0, () => {
        adjustTabs()
      })

      return () => {
        tabsRef.current.delete(tabRef)
        schedule(0, () => {
          adjustTabs()
        })
      }
    },
    [schedule, adjustTabs],
  )

  const itemIndicator = React.useCallback(
    (indicatorRef: React.RefObject<HTMLDivElement>) => {
      indicatorsRef.current.add(indicatorRef)
      return () => {
        indicatorsRef.current.delete(indicatorRef)
      }
    },
    [],
  )
  const context = React.useMemo<TabsContextValue>(
    () => ({
      rootRef,
      listRef,
      hiddenListRef,
      itemTab,
      itemIndicator,
    }),
    [itemTab, itemIndicator],
  )

  return (
    <TabsPrimitive.Root
      {...props}
      ref={mergeRefs([ref, rootRef])}
      demo-tabs-root=''
      orientation='horizontal'
      value={valueProps}
      onValueChange={async (v) => {
        onValueChange?.(v)

        const tabs = listTabs()
        const previousTab = tabs?.find(
          (tab) => tab.getAttribute('data-state') === 'active',
        )
        const nextTab = tabs?.find(
          (tab) => tab.getAttribute('data-value') === v,
        )
        if (!nextTab) return

        nextTab?.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
          behavior: 'smooth',
        })

        moveActiveIndicator({
          previousTab,
          nextTab,
          instant: false,
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
>(function TabsList({ children, ...props }, ref) {
  const { listRef } = useTabsContext()

  return (
    <TabsPrimitive.List
      {...props}
      ref={mergeRefs([ref, listRef])}
      demo-tabs=''
    >
      {children}
    </TabsPrimitive.List>
  )
})

const TabsHiddenList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithRef<typeof TabsPrimitive.List>
>(function TabsList({ children, style, ...props }, ref) {
  const { hiddenListRef } = useTabsContext()

  return (
    <TabsPrimitive.List
      {...props}
      ref={mergeRefs([ref, hiddenListRef])}
      demo-tabs-hidden=''
      style={{
        ...style,
        clipPath: 'inset(100% 0 0 0)',
      }}
      aria-hidden
      tabIndex={-1}
    >
      {children}
    </TabsPrimitive.List>
  )
})

interface TabsTriggerProps extends TabsPrimitive.TabsTriggerProps {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(function TabsTrigger({ children, ...props }, ref) {
  const { itemTab } = useTabsContext()
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const cleanup = itemTab(triggerRef)
    return cleanup
  }, [itemTab])

  return (
    <TabsPrimitive.Trigger
      {...props}
      ref={mergeRefs([ref, triggerRef])}
      demo-tab=''
      data-value={props.value}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
})

interface TabsIndicatorProps extends React.ComponentPropsWithRef<typeof Slot> {
  asChild?: boolean
}

const TabsIndicator = React.forwardRef<
  React.ElementRef<'div'>,
  TabsIndicatorProps
>(function TabsIndicator({ asChild = false, ...props }, ref) {
  const Comp = asChild ? Slot : 'div'

  const indicatorRef = React.useRef<HTMLDivElement>(null)
  const { itemIndicator } = useTabsContext()

  React.useEffect(() => {
    const cleanup = itemIndicator(indicatorRef)
    return cleanup
  }, [itemIndicator])

  return (
    <Comp
      {...props}
      ref={mergeRefs([ref, indicatorRef])}
      demo-tab-indicator=''
    />
  )
})

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
const List = TabsList
const HiddenList = TabsHiddenList
const Trigger = TabsTrigger
const Indicator = TabsIndicator
const Content = TabsPrimitive.Content

export { Root, List, HiddenList, Trigger, Indicator, Content }
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps }