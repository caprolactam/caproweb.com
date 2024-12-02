import * as AspectRatio from '@radix-ui/react-aspect-ratio'
import * as Tabs from '@radix-ui/react-tabs'
import {
  motion,
  useMotionValue,
  AnimatePresence,
  useInView,
} from 'framer-motion'
import React from 'react'
import { Icon } from '#app/components/parts/icon.tsx'
import {
  cn,
  useIsomorphicLayoutEffect,
  mergeRefs,
  set,
  strictEntries,
} from '../utils/misc.ts'
import {
  tabValues,
  type Tab,
  type Status,
  TabsContext,
  useTabsContext,
  tabs,
} from './context.ts'
import { Switch } from './switch.tsx'
import { useInterval, useIsDocumentHidden } from './utils.ts'

const CONTENT_IDENTITY = '[demo-content=""]'

const AUTOPLAY_DURATION = 5000
const SWITCHING_DURATION = 1000
const COUNT_INTERVAL = 50

const CONTENT_GAP = 24

const ALL_ENTER_CONTAINER_DURATION = 0.675
const ENTER_CONTAINER_DURATION = 0.45
const ENTER_TRANSFORM_DURATION = 0.25
const ENTER_OPACITY_DELAY =
  ALL_ENTER_CONTAINER_DURATION + ENTER_TRANSFORM_DURATION - 0.1
const ENTER_OPACITY_DURATION = 0.4

const EXIT_OPACITY_DURATION = 0.05
const EXIT_TRANSFORM_DURATION = 0.45
const EXIT_CONTAINER_DURATION = 0.35

const TabRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<(typeof Tabs)['Root']> & {
    value: string
    onValueChange: (value: string) => void
    visible: boolean
    status: Status
    onStatusChange: (status: Status) => void
    onClose?: () => void
  }
>(function TabRoot(
  {
    children,
    visible,
    status,
    onStatusChange,
    onClose,
    value,
    onValueChange: onValueChangeProps,
    ...props
  },
  ref,
) {
  const [canAutoPlay, setCanAutoPlay] = React.useState<boolean>(false)
  const autoPlayTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const currentRef = React.useRef<number>(0)

  const contentListRef = React.useRef<HTMLDivElement | null>(null)
  const contentSet = React.useRef<Set<React.RefObject<HTMLDivElement>>>(
    new Set(),
  )
  const contentWidth = React.useRef(0)
  const scrollContentRef = React.useRef<HTMLDivElement | null>(null)
  const contentXAnimation = React.useRef<NodeJS.Timeout | null>(null)
  const progress = useMotionValue(0)

  const getValidContents = () => {
    if (!contentSet.current || !contentListRef.current) return
    const tabNodes = Array.from(
      contentListRef.current.querySelectorAll(CONTENT_IDENTITY),
    )

    const items = [...contentSet.current]
      .map((tab) => tab.current)
      .filter(Boolean)
      .filter((tab) => tabNodes.includes(tab))
      .sort((a, b) => tabNodes.indexOf(a) - tabNodes.indexOf(b))

    return items
  }

  const transformContentList = React.useCallback(
    (changeTarget: string | null, shouldAnimate = true) => {
      const list = contentListRef.current
      if (!list) return
      const contents = getValidContents() ?? []
      let nextIndex: number
      ;(() => {
        let targetTab: HTMLDivElement | undefined
        if (changeTarget == null) {
          targetTab = contents.find(
            (content) => content.getAttribute('data-state') === 'active',
          )
        } else {
          targetTab = contents.find(
            (content) => content.getAttribute('data-value') === changeTarget,
          )
        }

        if (targetTab == null) {
          nextIndex = 0
          return
        }

        nextIndex = contents.indexOf(targetTab)
        if (nextIndex === -1) {
          nextIndex = 0
        }
      })()

      const x = (contentWidth.current + CONTENT_GAP) * nextIndex * -1

      if (shouldAnimate) {
        setCanAutoPlay(false)
        set(scrollContentRef.current, {
          transform: `translate3d(${x}px, 0, 0)`,
          transition: 'transform 1s cubic-bezier(0.645, 0.045, 0.355, 1)',
        })
        if (contentXAnimation.current) {
          clearTimeout(contentXAnimation.current)
        }
        contentXAnimation.current = setTimeout(() => {
          setCanAutoPlay(true)
        }, SWITCHING_DURATION)
        return
      }
      set(scrollContentRef.current, {
        transform: `translate3d(${x}px, 0, 0)`,
        transition: 'none',
      })
    },
    [],
  )

  React.useEffect(() => {
    const cotentXanimationRef = contentXAnimation.current
    if (cotentXanimationRef) {
      return () => {
        clearTimeout(cotentXanimationRef)
      }
    }
  }, [])

  const pauseAutoPlay = () => {
    if (status === 'playing') {
      onStatusChange('paused')
    }
  }

  const playAutoPlay = () => {
    if (status === 'paused') {
      onStatusChange('playing')
    }
  }

  const handleChangeValue = React.useCallback(
    (value: string) => {
      transformContentList(value)
      onValueChangeProps(value)
      currentRef.current = 0
      progress.set(0)
    },
    [transformContentList, onValueChangeProps, progress],
  )

  function handlePlayPause() {
    switch (status) {
      case 'playing':
        onStatusChange('paused')
        break
      case 'paused':
        onStatusChange('playing')
        break
      case 'finished':
        onStatusChange('playing')
        handleChangeValue('tab1')
        break
      default: {
        throw new Error('invalid status')
      }
    }
  }

  React.useEffect(() => {
    function autoPlay() {
      if (status === 'playing' && canAutoPlay && visible) {
        autoPlayTimerRef.current = setTimeout(
          () => {
            if (value === 'tab4') {
              onStatusChange('finished')
            } else {
              const nextValue = tabValues[tabValues.indexOf(value) + 1]
              if (nextValue == null) return
              handleChangeValue(nextValue)
            }
          },
          Math.max(AUTOPLAY_DURATION - currentRef.current, 0),
        )

        return () => {
          if (autoPlayTimerRef.current) {
            clearTimeout(autoPlayTimerRef.current)
          }
        }
      } else if (status === 'paused') {
        if (autoPlayTimerRef.current) {
          clearTimeout(autoPlayTimerRef.current)
        }
      }
    }

    const cleanup = autoPlay()

    return cleanup
  }, [value, status, canAutoPlay, visible, onStatusChange, handleChangeValue])

  const IsDocumentHidden = useIsDocumentHidden()
  const prevState = React.useRef<Status | null>(null)

  React.useEffect(() => {
    if (IsDocumentHidden) {
      if (status === 'playing') {
        prevState.current = status
        onStatusChange('paused')
      }
    } else {
      if (prevState.current === 'playing') {
        onStatusChange('playing')
        prevState.current = null
      }
    }
  }, [IsDocumentHidden, status, onStatusChange])

  useInterval(
    () => {
      const newCurrent = currentRef.current + COUNT_INTERVAL
      progress.set(Math.min(newCurrent / AUTOPLAY_DURATION, 1))
      currentRef.current = newCurrent
    },
    status === 'playing' && canAutoPlay ? COUNT_INTERVAL : null,
  )

  useIsomorphicLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((_el) => {
        function changeContentWidth() {
          const list = contentListRef.current
          if (!list) return

          const listWidth = list.getBoundingClientRect().width

          const contents = getValidContents() ?? []

          contents.forEach((tab) => {
            set(tab, {
              width: `${listWidth}px`,
            })
          })

          contentWidth.current = listWidth
        }

        changeContentWidth()
        transformContentList(null, false)
      })
    })

    if (contentListRef.current) {
      observer.observe(contentListRef.current)
    }
    return () => {
      observer.disconnect()
    }
  }, [transformContentList])

  const item = React.useCallback((content: React.RefObject<HTMLDivElement>) => {
    contentSet.current.add(content)

    return () => {
      contentSet.current.delete(content)
    }
  }, [])

  return (
    <Tabs.Root
      ref={ref}
      {...props}
      value={value}
      onValueChange={(v) => {
        const newIndex = tabValues.indexOf(v)
        if (newIndex === -1) return
        handleChangeValue(v)
        if (status === 'finished') {
          onStatusChange('paused')
        }
      }}
    >
      <TabsContext.Provider
        value={{
          item,
          handlePlayPause,
          setCanAutoPlay,
          scrollContentRef,
          contentListRef,
          progress,
          value,
          status,
          visible,
          pauseAutoPlay,
          playAutoPlay,
          onClose,
        }}
      >
        {children}
      </TabsContext.Provider>
    </Tabs.Root>
  )
})

function TabContentList({
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'div'>, 'className'>) {
  const {
    contentListRef,
    pauseAutoPlay,
    playAutoPlay,
    status,
    scrollContentRef,
  } = useTabsContext()
  const pointerTypeRef = React.useRef<
    React.PointerEvent<HTMLDivElement>['pointerType'] | null
  >(null)

  const prevStatusOnEnter = React.useRef<Status | null>(null)

  return (
    <div
      ref={contentListRef}
      {...props}
      className='flex overflow-hidden'
    >
      <motion.div
        ref={scrollContentRef}
        className='flex h-full gap-6'
        onFocus={() => {
          pauseAutoPlay()
        }}
        onBlur={() => {
          if (pointerTypeRef.current !== 'touch') {
            playAutoPlay()
          }
          pointerTypeRef.current = null
        }}
        onPointerOver={(e) => {
          if (e.pointerType !== 'touch') {
            pauseAutoPlay()
            prevStatusOnEnter.current = status
          }
        }}
        onPointerLeave={(e) => {
          if (
            e.pointerType !== 'touch' &&
            prevStatusOnEnter.current === 'playing'
          ) {
            playAutoPlay()
          }
          pointerTypeRef.current = e.pointerType
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

const TabContent = React.forwardRef<
  HTMLDivElement,
  Omit<
    React.ComponentPropsWithoutRef<(typeof Tabs)['Content']>,
    'forceMount' | 'children'
  > & {
    apiUrl: string
    alt: string
  }
>(function TabContent({ className, apiUrl, alt, ...props }, ref) {
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const { item, value } = useTabsContext()

  React.useEffect(() => {
    if (contentRef.current) {
      const cleanup = item(contentRef)
      return cleanup
    }
  }, [item])

  const isActive = value === props.value

  return (
    <Tabs.Content
      ref={mergeRefs([ref, contentRef])}
      {...props}
      forceMount
      demo-content=''
      data-value={props.value}
      tabIndex={isActive ? undefined : -1}
      aria-hidden={isActive ? undefined : true}
      className={cn('relative grow', className)}
    >
      <AspectRatio.Root
        ratio={16 / 9}
        className='overflow-hidden rounded-xl bg-[rgba(232,232,237,0.7)]'
      >
        <img
          className='absolute inset-0 size-full object-cover'
          src={apiUrl}
          alt={alt}
        />
      </AspectRatio.Root>
    </Tabs.Content>
  )
})

const TabTrigger = React.forwardRef<
  HTMLButtonElement,
  Omit<
    React.ComponentPropsWithoutRef<(typeof Tabs)['Trigger']>,
    'children' | 'className' | 'asChild'
  >
>(function TabTrigger(props, ref) {
  const { value, progress } = useTabsContext()
  const isActive = value === props.value

  return (
    <Tabs.Trigger
      ref={ref}
      {...props}
      className={cn(
        'relative h-2 shrink-0 rounded-[10px] outline-2 outline-offset-2 focus-visible:outline focus-visible:outline-blue-500',
        isActive && 'pointer-events-none overflow-hidden',
      )}
      tabIndex={isActive ? 0 : -1}
      asChild
    >
      <motion.button
        animate={isActive ? 'select' : 'unselect'}
        variants={{
          select: {
            minWidth: '48px',
          },
          unselect: {
            minWidth: '8px',
          },
        }}
        transition={{
          ease: [0.33, 0, 0.67, 1],
          duration: 0.4,
        }}
        style={{
          minWidth: '8px',
          backgroundColor: 'rgba(29, 29, 31, 0.6)',
        }}
      >
        {isActive && (
          <motion.div
            className='absolute size-full origin-left rounded-[10px] bg-[rgb(29,29,31)]'
            style={{ scaleX: progress, y: '-50%' }}
          />
        )}
        <TouchTarget />
      </motion.button>
    </Tabs.Trigger>
  )
})

const PlayPause = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentPropsWithoutRef<(typeof motion)['button']>, 'children'>
>(function PlayPause({ onClick, ...props }, ref) {
  const { status, handlePlayPause, setCanAutoPlay, visible } = useTabsContext()

  return (
    <motion.button
      className='absolute top-0 flex size-14 items-center justify-between rounded-[32px] outline-2 hover:bg-[rgba(223,223,227,0.698)] hover:transition-colors hover:duration-100 hover:ease-linear focus-visible:outline focus-visible:outline-blue-500'
      ref={ref}
      {...props}
      type='button'
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        handlePlayPause()
      }}
      animate={visible ? 'show' : 'hide'}
      style={{
        color: 'rgb(29 29 31)',
        boxShadow: 'inset 0 0 1px rgba(0, 0, 0, 0.11)',
        backgroundColor: 'rgba(232, 232, 237, 0.7)',
      }}
      variants={{
        show: {
          x: 90,
          transition: {
            type: 'spring',
            duration: ENTER_TRANSFORM_DURATION,
            delay: ALL_ENTER_CONTAINER_DURATION,
          },
        },
        hide: {
          x: 0,
          transition: {
            type: 'spring',
            bounce: 0.1,
            duration: EXIT_TRANSFORM_DURATION,
          },
        },
      }}
      onAnimationComplete={() => {
        if (visible) {
          setCanAutoPlay(true)
        }
      }}
    >
      <motion.span
        className='inline-flex size-full items-center justify-center rounded-full'
        style={{
          opacity: 0,
        }}
        animate={visible ? 'show' : 'hide'}
        variants={{
          show: {
            opacity: 1,
            transition: {
              type: 'tween',
              duration: ENTER_OPACITY_DURATION,
              delay: ENTER_OPACITY_DELAY,
            },
          },
          hide: {
            opacity: 0,
            transition: {
              type: 'tween',
              duration: EXIT_OPACITY_DURATION,
            },
          },
        }}
      >
        {status === 'playing' ? (
          <Icon
            name='pause-fill'
            size='2.25em'
          />
        ) : status === 'paused' ? (
          <Icon
            name='play-arrow-fill'
            className='translate-x-0.5'
            size='2.5em'
          />
        ) : (
          <Icon
            name='replay'
            size='2em'
          />
        )}
      </motion.span>
    </motion.button>
  )
})

const FluidControls = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<(typeof motion)['div']>, 'children'>
>(function FluidControls({ className, ...props }, ref) {
  const { visible, onClose, setCanAutoPlay } = useTabsContext()
  const [entering, setEntering] = React.useState(false)

  return (
    <motion.div
      {...props}
      ref={ref}
      className={cn('relative size-14', className)}
      style={{
        y: 86,
        scale: 0.01,
      }}
      animate={visible ? 'show' : 'hide'}
      variants={{
        show: {
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            bounce: 0.15,
            duration: ENTER_CONTAINER_DURATION,
          },
        },
        hide: {
          y: 0,
          scale: 0.01,
          transition: {
            type: 'spring',
            bounce: 0.15,
            duration: EXIT_CONTAINER_DURATION,
            delay: EXIT_TRANSFORM_DURATION - 0.075,
          },
          transitionEnd: {
            y: 86,
          },
        },
      }}
      onAnimationStart={() => {
        if (visible) {
          setEntering(true)
          setCanAutoPlay(false)
        }
      }}
      onAnimationComplete={() => {
        if (!visible) {
          onClose?.()
        }
      }}
    >
      <AnimatePresence>
        {entering && (
          <motion.div
            className='absolute inset-0 rounded-full bg-blue-500'
            style={{
              scale: 0.01,
            }}
            animate={{
              scale: 1.6,
              transition: {
                type: 'spring',
                duration: ENTER_CONTAINER_DURATION - 0.05,
                bounce: 0.15,
                delay: 0.05,
              },
              opacity: 1,
            }}
            exit={{
              scale: 0.8,
              opacity: 0,
              transition: {
                duration:
                  ALL_ENTER_CONTAINER_DURATION - ENTER_CONTAINER_DURATION,
              },
            }}
            onAnimationComplete={() => {
              setEntering(false)
            }}
          />
        )}
      </AnimatePresence>
      <Tabs.List asChild>
        <motion.div
          className='absolute top-0 flex size-14 items-center justify-between rounded-full'
          animate={visible ? 'show' : 'hide'}
          style={{
            color: 'rgb(29 29 31)',
            boxShadow: 'inset 0 0 1px rgba(0, 0, 0, 0.11)',
            backgroundColor: 'rgba(232, 232, 237, 0.7)',
          }}
          variants={{
            show: {
              width: 168,
              x: -95,
              transition: {
                type: 'spring',
                duration: ENTER_TRANSFORM_DURATION,
                delay: ALL_ENTER_CONTAINER_DURATION,
              },
            },
            hide: {
              width: 56,
              x: 0,
              transition: {
                type: 'spring',
                bounce: 0.1,
                duration: EXIT_TRANSFORM_DURATION,
              },
            },
          }}
        >
          <motion.div
            className='w-full px-6'
            style={{
              opacity: 0,
            }}
            animate={visible ? 'show' : 'hide'}
            variants={{
              show: {
                opacity: 1,
                transition: {
                  type: 'tween',
                  duration: ENTER_OPACITY_DURATION,
                  delay: ENTER_OPACITY_DELAY,
                },
              },
              hide: {
                opacity: 0,
                transition: {
                  type: 'tween',
                  duration: EXIT_OPACITY_DURATION,
                },
              },
            }}
          >
            <div className='flex gap-4'>
              <TabTrigger value={'tab1' as Tab} />
              <TabTrigger value={'tab2' as Tab} />
              <TabTrigger value={'tab3' as Tab} />
              <TabTrigger value={'tab4' as Tab} />
            </div>
          </motion.div>
        </motion.div>
      </Tabs.List>
      <PlayPause />
    </motion.div>
  )
})

function TouchTarget() {
  return (
    <div className='absolute inset-1/2 size-6 -translate-x-1/2 -translate-y-1/2' />
  )
}

export function CarouselWithFluidControls() {
  const [value, setValue] = React.useState('tab1')
  const [visible, setVisible] = React.useState(true)
  const [status, setStatus] = React.useState<Status>('playing')
  const prevStatus = React.useRef<Status | null>(null)
  const [openable, setOpenable] = React.useState(true)

  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const isInView = useInView(containerRef, {
    once: true,
    amount: 'all',
  })

  const switchId = React.useId()

  return (
    <TabRoot
      value={value}
      onValueChange={setValue}
      visible={isInView && visible}
      status={status}
      onStatusChange={setStatus}
      onClose={() => setOpenable(true)}
    >
      <div className='grid'>
        <TabContentList>
          {strictEntries(tabs).map(([tab, content]) => (
            <TabContent
              key={tab}
              value={tab}
              className='relative size-full'
              apiUrl={content.apiUrl}
              alt={content.alt}
            />
          ))}
        </TabContentList>
        <div className='flex h-36 items-center justify-center'>
          <div ref={containerRef}>
            <FluidControls
              onFocus={(e) => {
                if (containerRef.current?.contains(e.target) && !visible) {
                  setVisible(true)
                }
              }}
            />
          </div>
        </div>
        <div className='flex h-14 items-center justify-between gap-3 border-t border-neutral-200'>
          <label
            htmlFor={switchId}
            className='relative text-sm before:absolute before:inset-y-1/2 before:h-14 before:w-full before:-translate-y-1/2'
          >
            Toggle Controls
          </label>
          <Switch
            id={switchId}
            checked={visible}
            disabled={!openable}
            onCheckedChange={(checked) => {
              if (checked) {
                if (prevStatus.current === 'playing') {
                  setStatus('playing')
                }
                prevStatus.current = null
              } else {
                if (status === 'playing') {
                  setStatus('paused')
                }
                prevStatus.current = status
              }
              setVisible(checked)
              setOpenable(checked)
            }}
          />
        </div>
      </div>
    </TabRoot>
  )
}
