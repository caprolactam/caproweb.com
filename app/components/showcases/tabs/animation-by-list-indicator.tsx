'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import React from 'react'
import { mergeRefs, useIsomorphicLayoutEffect, cn, set } from '../utils/misc.ts'
import {
  DEFAULT_DURATION,
  DEFAULT_EASE,
  type Indicator,
  triggerStyles,
  indicatorContainerStyles,
  indicatorStyles,
  triggerLabelStyles,
  useScheduleLayoutEffect,
} from './base.tsx'

type TabsContextValue = {
  rootRef: React.RefObject<HTMLDivElement | null>
  listRef: React.RefObject<HTMLDivElement | null>
  activeIndicatorRef: React.RefObject<HTMLDivElement | null>
  itemTab: (triggerRef: React.RefObject<HTMLButtonElement | null>) => () => void
  itemIndicator: (
    indicatorRef: React.RefObject<HTMLDivElement | null>,
  ) => () => void
  indicator: Indicator
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

const useTabsContext = () => {
  const context = React.use(TabsContext)
  if (!context) {
    throw new Error('useTabsContext must be used within a TabsProvider')
  }
  return context
}

interface TabsProps
  extends Omit<
    React.ComponentPropsWithRef<typeof TabsPrimitive.Root>,
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
  /**
   * The indicator type.
   * @defaultValue 'underline'
   */
  indicator?: Indicator
  /**
   * separate tabs and indicators for demo purposes, so you can remove this prop.
   * @ignore
   */
  _separated?: boolean
}

function Tabs({
  children,
  value: valueProps,
  onValueChange,
  duration = DEFAULT_DURATION,
  easing = `cubic-bezier(${DEFAULT_EASE.join(',')})`,
  indicator = 'underline',
  _separated = false,
  ref,
  ...props
}: TabsProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const activeIndicatorRef = React.useRef<HTMLDivElement>(null)
  const tabsRef = React.useRef<Set<React.RefObject<HTMLButtonElement | null>>>(
    new Set(),
  )
  const indicatorsRef = React.useRef<
    Set<React.RefObject<HTMLDivElement | null>>
  >(new Set())
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
      previousTab?: HTMLElement | undefined
      nextTab: HTMLElement
      instant?: boolean
    }) => {
      const list = listRef.current
      const activeIndicator = activeIndicatorRef.current

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

      if (!list || !activeIndicator || !nextIndicator) return

      // you can remove this line.
      const separatedY = _separated ? 48 : 0

      if (!previousTab || !prevIndicator) {
        const { left: listLeft, top: listTop } = list.getBoundingClientRect()
        const { left, width, height, top } =
          nextIndicator.getBoundingClientRect()

        const translateX = left - listLeft
        const translateY = top - listTop + separatedY

        activeIndicator
          .getAnimations()
          .forEach((animation) => animation.cancel())

        set(activeIndicator, {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
          transitionDuration: '0s',
        })

        activeIndicator.animate(
          {
            opacity: [0, 1],
          },
          keyframeOption,
        )
        return
      }

      if (prevIndicator === nextIndicator) return

      const { left: listLeft, top: listTop } = list.getBoundingClientRect()
      const {
        left: prevLeft,
        top: prevTop,
        width: prevWidth,
      } = activeIndicator.getBoundingClientRect()
      const {
        left: nextLeft,
        top: nextTop,
        width: nextWidth,
        height: nextHeight,
      } = nextIndicator.getBoundingClientRect()

      const prevScaleX = prevWidth / nextWidth
      const prevTranslateX = prevLeft - listLeft
      const prevTranslateY = prevTop - listTop
      const nextTranslateX = nextLeft - listLeft
      const nextTranslateY = nextTop - listTop + separatedY

      set(activeIndicator, {
        width: `${nextWidth}px`,
        height: `${nextHeight}px`,
        transitionDuration: '0s',
      })

      activeIndicator.getAnimations().forEach((animation) => animation.cancel())

      activeIndicator.animate(
        [
          {
            transform: `translate3d(${prevTranslateX}px, ${prevTranslateY}px, 0) scale3d(${prevScaleX}, 1, 1)`,
          },
          {
            transform: `translate3d(${nextTranslateX}px, ${nextTranslateY}px, 0)`,
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
    [easing, duration, _separated],
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

    if (!activeTab) return

    moveActiveIndicator({
      nextTab: activeTab,
      instant: true,
    })
  }, [moveActiveIndicator, listTabs])

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

  React.useEffect(() => {
    adjustTabs()
  }, [adjustTabs, indicator])

  const itemTab = React.useCallback(
    (tabRef: React.RefObject<HTMLButtonElement | null>) => {
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
    (indicatorRef: React.RefObject<HTMLDivElement | null>) => {
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
      activeIndicatorRef,
      itemTab,
      itemIndicator,
      indicator,
    }),
    [itemTab, itemIndicator, indicator],
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
      <TabsContext value={context}>{children}</TabsContext>
    </TabsPrimitive.Root>
  )
}

interface TabsListProps
  extends React.ComponentPropsWithRef<typeof TabsPrimitive.List> {}

function TabsList({ children, className, ref, ...props }: TabsListProps) {
  const { listRef, activeIndicatorRef, indicator } = useTabsContext()

  return (
    <TabsPrimitive.List
      {...props}
      ref={mergeRefs([ref, listRef])}
      demo-tabs=''
      className={cn(className, 'relative')}
    >
      {children}
      <div
        ref={activeIndicatorRef}
        className={cn(
          'absolute inset-0 size-0 origin-left',
          indicator === 'underline'
            ? 'rounded-t-[3px] bg-green-9'
            : 'rounded-[3px] bg-green-6',
        )}
      />
    </TabsPrimitive.List>
  )
}

interface TabsTriggerProps
  extends Omit<
    React.ComponentPropsWithRef<typeof TabsPrimitive.Trigger>,
    'children' | 'asChild'
  > {
  children: string
}

function TabsTrigger({ children, className, ref, ...props }: TabsTriggerProps) {
  const tempId = React.useId()
  const id = props.id ?? tempId
  const { itemTab, itemIndicator, indicator } = useTabsContext()
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const indicatorRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const cleanupItem = itemTab(triggerRef)
    const cleanupIndicator = itemIndicator(indicatorRef)
    return () => {
      cleanupItem()
      cleanupIndicator()
    }
  }, [itemTab, itemIndicator])

  const tabLabel = `tab-${props.value}-${id}`

  return (
    <TabsPrimitive.Trigger
      {...props}
      ref={mergeRefs([ref, triggerRef])}
      demo-tab=''
      data-value={props.value}
      asChild={false}
      className={cn(triggerStyles, 'before:absolute before:inset-0', className)}
      aria-labelledby={tabLabel}
    >
      <div className={cn(indicatorContainerStyles({ indicator }))}>
        <div
          ref={indicatorRef}
          demo-tab-indicator=''
          className={cn(
            indicatorStyles({
              indicator,
            }),
          )}
        />
        <span
          className={cn(triggerLabelStyles({ indicator }))}
          id={tabLabel}
        >
          {children}
        </span>
      </div>
    </TabsPrimitive.Trigger>
  )
}

const Root = Tabs
const List = TabsList
const Trigger = TabsTrigger
const Content = TabsPrimitive.Content

export { Root, List, Trigger, Indicator, Content }
