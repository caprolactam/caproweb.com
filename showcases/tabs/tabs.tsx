import { Slot } from '@radix-ui/react-slot'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import React from 'react'
import { mergeRefs, set, useIsomorphicLayoutEffect } from '../utils/misc.ts'
import {
  type TabsContextValue,
  TabsContext,
  useTabsContext,
} from './context.ts'
import './styles.css'
import {
  getTranslate,
  dampenValue,
  getTextWidth,
  getCanvasFont,
  useScheduleLayoutEffect,
} from './utils.ts'

const DURATION = 300
const EASE = [0.2, 0, 0, 1]

export type UnderlineOption = 'text' | 'tab'
type RootProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
  underline?: UnderlineOption
}

const Root = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  RootProps
>(function Root(
  { children, value: valueProps, onValueChange, underline = 'tab', ...props },
  ref,
) {
  const [tabsCount, setTabsCount] = React.useState(0)
  const [focusedTab, setFocusedTab] = React.useState<number>(0)

  const rootRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const hiddenListRef = React.useRef<HTMLDivElement>(null)
  const tabSet = React.useRef<Set<React.RefObject<HTMLButtonElement>>>(
    new Set(),
  )
  const tabWidthRef = React.useRef(0)
  const values = React.useRef<Set<string>>(new Set())

  const [isDragging, setIsDragging] = React.useState<boolean>(false)
  const isAllowedToDrag = React.useRef<boolean>(false)
  const pointerStart = React.useRef<number>(0)
  const maxAllowedMovement = React.useRef<number>(0)
  const transformXStart = React.useRef<number>(0)

  const schedule = useScheduleLayoutEffect()

  const onPress = React.useCallback((e: React.PointerEvent) => {
    if (
      !rootRef.current ||
      !listRef.current ||
      !listRef.current.contains(e.target as Node) ||
      // you need distinguish between click and drag when using mouse devices,
      // but it is too difficult to improve that when using radix tabs on current implementation.
      e.pointerType === 'mouse'
    )
      return

    const rootW = rootRef.current.getBoundingClientRect().width
    const listW = listRef.current.getBoundingClientRect().width

    const isOverflow = listW > rootW
    if (!isOverflow) return

    maxAllowedMovement.current = listW - rootW

    transformXStart.current = getTranslate(listRef.current) ?? 0
    setIsDragging(true)
    // Ensure we maintain correct pointer capture even when going outside of the drawer
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    pointerStart.current = e.clientX
  }, [])

  function getDragPosition(
    e: React.PointerEvent,
  ): 'outer-left' | 'inner' | 'outer-right' {
    const draggedDistance = pointerStart.current - e.clientX
    const totalMovement = draggedDistance + transformXStart.current * -1

    if (totalMovement < 0) return 'outer-left'
    if (totalMovement > maxAllowedMovement.current) return 'outer-right'
    return 'inner'
  }

  const onDrag = React.useCallback(
    (e: React.PointerEvent) => {
      if (!listRef.current || !hiddenListRef.current || !isDragging) return

      const draggedDistance = (pointerStart.current - e.clientX) * -1

      const dragPosition = getDragPosition(e)
      const shouldDampen = dragPosition !== 'inner'

      // If shouldDrag gave true once after pressing down on the drawer, we set isAllowedToDrag to true and it will remain true until we let go, there's no reason to disable dragging mid way, ever, and that's the solution to it
      isAllowedToDrag.current = true
      set(listRef.current, {
        transition: 'none',
      })
      set(hiddenListRef.current, {
        transition: 'none',
      })

      // Run this only if snapPoints are not defined or if we are at the last snap point (highest one)
      if (shouldDampen) {
        if (dragPosition === 'outer-left') {
          const dampenedDraggedDistance = Math.max(
            dampenValue(Math.abs(draggedDistance + transformXStart.current)),
            0,
          )

          set(listRef.current, {
            transform: `translate3d(${dampenedDraggedDistance}px, 0, 0)`,
          })
          set(hiddenListRef.current, {
            transform: `translate3d(${dampenedDraggedDistance}px, 0, 0)`,
          })
          return
        } else {
          const dampenedDraggedDistance = dampenValue(
            Math.abs(
              draggedDistance * -1 +
                transformXStart.current * -1 -
                maxAllowedMovement.current,
            ),
          )
          const translateValue =
            Math.max(
              dampenedDraggedDistance + maxAllowedMovement.current,
              maxAllowedMovement.current,
            ) * -1

          set(listRef.current, {
            transform: `translate3d(${translateValue}px, 0, 0)`,
          })
          set(hiddenListRef.current, {
            transform: `translate3d(${translateValue}px, 0, 0)`,
          })
          return
        }
      }

      // We need to capture last time when drag with scroll was triggered and have a timeout between
      const translateValue = draggedDistance + transformXStart.current

      set(listRef.current, {
        transform: `translate3d(${translateValue}px, 0, 0)`,
      })
      set(hiddenListRef.current, {
        transform: `translate3d(${translateValue}px, 0, 0)`,
      })
    },
    [isDragging],
  )

  const onRelease = React.useCallback(
    (_e: React.PointerEvent) => {
      if (!isDragging || !listRef.current) return
      isAllowedToDrag.current = false
      setIsDragging(false)
      const swipeAmount = (getTranslate(listRef.current) ?? 0) * -1

      if (!swipeAmount || Number.isNaN(swipeAmount)) return

      const transition = `transform ${DURATION}ms cubic-bezier(${EASE.join(',')})`

      if (swipeAmount < 0) {
        set(listRef.current, {
          transform: `translate3d(0, 0, 0)`,
          transition,
        })
        set(hiddenListRef.current, {
          transform: `translate3d(0, 0, 0)`,
          transition,
        })
        return
      } else if (swipeAmount > maxAllowedMovement.current) {
        set(listRef.current, {
          transform: `translate3d(${maxAllowedMovement.current * -1}px, 0, 0)`,
          transition,
        })
        set(hiddenListRef.current, {
          transform: `translate3d(${maxAllowedMovement.current * -1}px, 0, 0)`,
          transition,
        })
        return
      }

      set(listRef.current, {
        transform: `translate3d(${swipeAmount * -1}px, 0, 0)`,
        transition,
      })
      set(hiddenListRef.current, {
        transform: `translate3d(${swipeAmount * -1}px, 0, 0)`,
        transition,
      })
    },
    [isDragging],
  )

  React.useEffect(() => {
    const target = document.activeElement
    scrollFocusedIntoView(target)
  }, [])

  function scrollFocusedIntoView(target: Element | null) {
    const item = target as HTMLElement | null

    if (
      item?.closest('[demo-tabs=""] > [demo-tab=""]') == null ||
      !rootRef.current ||
      !listRef.current
    )
      return

    // distingush item is outer-left, outer-right or inner toward the container
    const rootWidth = rootRef.current.getBoundingClientRect().width
    const { offsetLeft } = item
    const swipeAmount = getTranslate(listRef.current) ?? 0

    // outer-left of the container
    if (swipeAmount * -1 > offsetLeft) {
      const transform = offsetLeft * -1

      set(listRef.current, {
        transform: `translate3d(${transform}px, 0, 0)`,
        transition: `transform ${DURATION}ms cubic-bezier(${EASE.join(',')})`,
      })
      set(hiddenListRef.current, {
        transform: `translate3d(${transform}px, 0, 0)`,
        transition: `transform ${DURATION}ms cubic-bezier(${EASE.join(',')})`,
      })
    } else if (
      // outer-right of the container
      offsetLeft + tabWidthRef.current >
      swipeAmount * -1 + rootWidth
    ) {
      const transform =
        (offsetLeft + tabWidthRef.current - (swipeAmount * -1 + rootWidth)) * -1

      set(listRef.current, {
        transform: `translate3d(${transform + swipeAmount}px, 0, 0)`,
        transition: `transform ${DURATION}ms cubic-bezier(${EASE.join(',')})`,
      })
      set(hiddenListRef.current, {
        transform: `translate3d(${transform + swipeAmount}px, 0, 0)`,
        transition: `transform ${DURATION}ms cubic-bezier(${EASE.join(',')})`,
      })
    }
  }

  const getValidItemsInList = React.useCallback(() => {
    if (!tabSet.current || !listRef.current) {
      return
    }
    const tabNodes = Array.from(
      listRef.current.querySelectorAll('[demo-tab=""]'),
    )

    const items = [...tabSet.current]
      .map((tab) => tab.current)
      .filter(Boolean)
      .filter((tab) => tabNodes.includes(tab))
      .sort((a, b) => tabNodes.indexOf(a) - tabNodes.indexOf(b))

    return items
  }, [])

  useIsomorphicLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((_el) => {
        if (
          !rootRef.current ||
          !listRef.current ||
          !hiddenListRef.current ||
          !tabSet.current ||
          tabsCount === 0
        )
          return

        const list = listRef.current
        const hiddenList = hiddenListRef.current

        const containerWidth = rootRef.current.getBoundingClientRect().width

        let maxTabWidth = 0

        const hiddenTabNodes = Array.from(
          hiddenList.querySelectorAll('[demo-tab=""]'),
        )

        const items = [...tabSet.current]
          .map((tab) => tab.current)
          .filter(Boolean)

        set(hiddenList, {
          width: 'auto',
        })

        const tabsInHiddenList = items
          .filter((tab) => hiddenTabNodes.includes(tab))
          .sort((a, b) => hiddenTabNodes.indexOf(a) - hiddenTabNodes.indexOf(b))

        tabsInHiddenList.forEach((tab) => {
          set(tab, {
            width: 'auto',
          })

          const width = tab.getBoundingClientRect().width

          if (width > maxTabWidth) {
            maxTabWidth = width
          }
        })

        const tempContainerWidth = maxTabWidth * tabsCount
        const nextContainerWidth = Math.max(tempContainerWidth, containerWidth)

        const selectedTab = tabsInHiddenList.find(
          (tab) => tab.getAttribute('data-state') === 'active',
        )

        const nextTabWidth = nextContainerWidth / tabsCount
        tabWidthRef.current = nextTabWidth

        const tabOrder = selectedTab ? tabsInHiddenList.indexOf(selectedTab) : 0

        items.forEach((tab) => {
          set(tab, {
            width: `${nextTabWidth}px`,
          })
        })

        set(list, {
          width: `${nextContainerWidth}px`,
        })

        const target = selectedTab ?? tabsInHiddenList[0]
        if (target) {
          set(hiddenList, {
            width: `${nextContainerWidth}px`,
            clipPath: getClipPathValue({
              tabOrder,
              tabWidth: nextTabWidth,
              target,
              underline,
            }),
            transition: 'none',
          })
        }

        const itemsInList = getValidItemsInList() ?? []
        const selectedTabInList = itemsInList.find(
          (tab) => tab.getAttribute('data-state') === 'active',
        )
        scrollFocusedIntoView(selectedTabInList ?? itemsInList[0]!)

        const swipeAmount = (getTranslate(list) ?? 0) * -1
        maxAllowedMovement.current = nextContainerWidth - containerWidth

        if (swipeAmount < 0) {
          set(list, {
            transform: `translate3d(0, 0, 0)`,
          })
          set(hiddenList, {
            transform: `translate3d(0, 0, 0)`,
          })
        } else if (swipeAmount > maxAllowedMovement.current) {
          set(list, {
            transform: `translate3d(${maxAllowedMovement.current * -1}px, 0, 0)`,
          })
          set(hiddenList, {
            transform: `translate3d(${maxAllowedMovement.current * -1}px, 0, 0)`,
          })
        }
      })
    })
    if (rootRef.current) {
      observer.observe(rootRef.current)
    }
    return () => {
      observer.disconnect()
    }
  }, [tabsCount, underline, getValidItemsInList])

  const item = React.useCallback(
    (tab: React.RefObject<HTMLButtonElement>) => {
      tabSet.current.add(tab)
      const value = tab.current?.getAttribute('data-value') ?? ''
      values.current.add(value)
      setTabsCount(values.current.size)

      function manageFocusedTab() {
        const tabs = getValidItemsInList()
        if (!tabs) return
        const activeElement = document.activeElement?.closest(
          '[demo-tabs=""] > [demo-tab=""]',
        ) as HTMLButtonElement | null
        // if activeElement is in the list, set focusedTab to it
        if (activeElement) {
          if (tabs?.indexOf(activeElement) !== -1) {
            setFocusedTab(tabs.indexOf(activeElement))
          } else {
            setFocusedTab(0)
          }
          return
        }

        // if activeElement is not in the list, treat [data-state="active"] tab as focusedTab.
        const activeTab = tabs.find(
          (tab) => tab.getAttribute('data-state') === 'active',
        )
        if (activeTab && tabs.indexOf(activeTab) !== -1) {
          setFocusedTab(tabs.indexOf(activeTab))
        } else {
          setFocusedTab(0)
        }
      }
      schedule(0, () => {
        manageFocusedTab()
      })

      return () => {
        tabSet.current.delete(tab)
        values.current.delete(value)
        setTabsCount(values.current.size)

        schedule(0, () => {
          manageFocusedTab()
        })
      }
    },
    [schedule, getValidItemsInList],
  )

  const updateFocusToNext = React.useCallback(() => {
    const items = getValidItemsInList()
    if (!items) return

    const index = focusedTab + 1
    if (index >= items.length) return

    const target = items[index]

    if (!target) return
    scrollFocusedIntoView(target)

    target.focus({
      // cannot use preventScroll option on Chrome for android, but it's okay.
      // autoscrolling dispatch when the focused tab is out of the container,
      // so autoscrolling happen when focusing programmatically.
      // it is not a problem since this function is not executed on mobile devices.
      // https://caniuse.com/?search=preventScroll%20
      preventScroll: true,
    })
  }, [focusedTab, getValidItemsInList])

  const updateFocusToPrevious = React.useCallback(() => {
    const items = getValidItemsInList()
    if (!items) return

    const index = focusedTab - 1
    if (index < 0) return

    const target = items[index]
    if (!target) return

    scrollFocusedIntoView(target)

    target.focus({
      preventScroll: true,
    })
  }, [focusedTab, getValidItemsInList])

  const context = React.useMemo<TabsContextValue>(
    () => ({
      tabsCount,
      focusedTab,
      rootRef,
      listRef,
      hiddenListRef,
      item,
      updateFocusToNext,
      updateFocusToPrevious,
      onPress,
      onDrag,
      onRelease,
    }),
    [
      tabsCount,
      focusedTab,
      item,
      updateFocusToNext,
      updateFocusToPrevious,
      onPress,
      onDrag,
      onRelease,
    ],
  )

  return (
    <TabsPrimitive.Root
      ref={mergeRefs([ref, rootRef])}
      {...props}
      demo-tabs-root=''
      value={valueProps}
      onValueChange={(v) => {
        onValueChange?.(v)

        const items = getValidItemsInList()
        if (!items) return

        const selectedTab = items.find(
          (item) => item.getAttribute('data-value') === v,
        )
        if (!selectedTab) return

        const tabOrder = items.indexOf(selectedTab)

        setFocusedTab(tabOrder)
        scrollFocusedIntoView(selectedTab)
        set(hiddenListRef.current, {
          clipPath: getClipPathValue({
            tabOrder,
            tabWidth: tabWidthRef.current,
            target: selectedTab,
            underline,
          }),
          transition: `${DURATION}ms cubic-bezier(${EASE.join(',')})`,
          transitionProperty: 'clip-path, transform',
        })
      }}
    >
      <TabsContext.Provider value={context}>{children}</TabsContext.Provider>
    </TabsPrimitive.Root>
  )
})

const List = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function List({ children, ...props }, ref) {
  const { listRef, hiddenListRef, onPress, onDrag, onRelease } =
    useTabsContext()

  return (
    <div demo-tabs-container=''>
      <TabsPrimitive.List
        ref={mergeRefs([ref, listRef])}
        {...props}
        demo-tabs=''
        onPointerDown={onPress}
        onPointerMove={onDrag}
        onPointerUp={onRelease}
      >
        {children}
      </TabsPrimitive.List>
      <TabsPrimitive.List
        ref={hiddenListRef}
        {...props}
        demo-tabs-hidden=''
        aria-hidden
        tabIndex={-1}
      >
        {children}
      </TabsPrimitive.List>
    </div>
  )
})

const Trigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function Trigger({ ...props }, ref) {
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const { item } = useTabsContext()

  React.useEffect(() => {
    const cleanup = item(triggerRef)

    return () => {
      cleanup()
    }
  }, [item])

  return (
    <TabsPrimitive.Trigger
      ref={mergeRefs([ref, triggerRef])}
      {...props}
      demo-tab=''
      data-value={props.value}
    />
  )
})

const Content = TabsPrimitive.Content

type FocusNextButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  asChild?: boolean
}
const FocusNextButton = React.forwardRef<
  HTMLButtonElement,
  FocusNextButtonProps
>(function FocusNextButton(
  { children, asChild = false, onClick, disabled, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button'
  const { tabsCount, focusedTab, updateFocusToNext } = useTabsContext()
  return (
    <Comp
      {...props}
      ref={ref}
      disabled={disabled || focusedTab === tabsCount - 1}
      onClick={(e) => {
        // @ts-ignore
        onClick?.(e)

        if (e.defaultPrevented) return

        updateFocusToNext()
      }}
    >
      {children}
    </Comp>
  )
})

type FocusPreviousButtonProps = React.ComponentPropsWithRef<'button'> & {
  asChild?: boolean
}
const FocusPreviousButton = React.forwardRef<
  HTMLButtonElement,
  FocusPreviousButtonProps
>(function FocusPreviousButton(
  { children, asChild = false, onClick, disabled, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button'
  const { tabsCount, focusedTab, updateFocusToPrevious } = useTabsContext()
  return (
    <Comp
      {...props}
      ref={ref}
      disabled={disabled || focusedTab === 0 || tabsCount <= 1}
      onClick={(e) => {
        // @ts-ignore
        onClick?.(e)

        if (e.defaultPrevented) return

        updateFocusToPrevious()
      }}
    >
      {children}
    </Comp>
  )
})

export { Root, List, Trigger, Content, FocusNextButton, FocusPreviousButton }

function getClipPathValue({
  tabOrder,
  tabWidth,
  target,
  underline,
}: {
  tabOrder: number
  tabWidth: number
  target: HTMLElement
  underline: UnderlineOption
}) {
  if (underline === 'text') {
    const textWidth = getTextWidth(target.innerText, getCanvasFont(target))
    const textToEdgeWidth = (tabWidth - textWidth) / 2
    return `inset(calc(100% - 3px) calc(100% - ${(tabOrder + 1) * tabWidth - textToEdgeWidth}px) 0 ${
      tabOrder * tabWidth + textToEdgeWidth
    }px round 3px 3px 0 0)`
  }

  return `inset(calc(100% - 3px) calc(100% - ${(tabOrder + 1) * tabWidth}px) 0 ${
    tabOrder * tabWidth
  }px round 3px 3px 0 0)`
}
