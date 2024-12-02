import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Command } from 'cmdk'
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  useRef,
  forwardRef,
} from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from '#app/components/parts/icon-button.tsx'
import { Icon } from '#app/components/parts/icon.tsx'
import { set, clamp, mergeRefs } from '../utils/misc.ts'
import {
  usePreventScroll,
  isInput,
  isIOS,
} from '../utils/use-prevent-scroll.ts'
import { dampenValue, getTranslateScale } from './helpers.ts'
import { useScrollEnd } from './scroller.ts'
import './styles.css'
import { usePositionFixed } from './use-position-fixed.ts'

const VELOCITY_THRESHOLD = 0.4
const CLOSE_THRESHOLD = 0.3
const WINDOW_TOP_OFFSET = 26
const DRAG_CLASS = 'search-dialog-dragging'
const HALF_OF_ICON_SIZE = 20
const TRANSITIONS = {
  ENTER: {
    DURATION: 400,
    EASE: [0.05, 0.7, 0.1, 1],
  },
  EXIT: {
    DURATION: 400,
    EASE: [0.3, 0, 0.8, 0.15],
  },
}

type DialogContext = {
  overlayRef: React.RefObject<HTMLDivElement>
  containerRef: React.RefObject<HTMLDivElement>
  contentRef: React.RefObject<HTMLDivElement>
  onPress: (event: React.PointerEvent<HTMLDivElement>) => void
  onRelease: (event: React.PointerEvent<HTMLDivElement>) => void
  onDrag: (event: React.PointerEvent<HTMLDivElement>) => void
  dismissible: boolean
  isOpen: boolean
  keyboardIsOpen: React.MutableRefObject<boolean>
  closeDrawer: () => void
  visible: boolean
  setVisible: (o: boolean) => void
  openProp?: boolean
  onOpenChange?: (o: boolean) => void
}
const DialogContext = createContext<DialogContext | undefined>(undefined)
const useDialogContext = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error(
      'Dialog components cannot be rendered outside the Dialog Context',
    )
  }

  return context
}

type DialogProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Root>,
  'defaultOpen' | 'modal'
> & {
  preventScrollRestoration?: boolean
  scrollLockTimeout?: number
  dismissible?: boolean
  onRelease?: (
    event: React.PointerEvent<HTMLDivElement>,
    open: boolean,
    tapped: boolean,
  ) => void
  onClose?: () => void
}
function Root({
  open: openProp,
  onOpenChange,
  children,
  preventScrollRestoration = true,
  dismissible = true,
  onRelease: onReleaseProp,
  onClose,
}: DialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasBeenOpened, setHasBeenOpened] = useState<boolean>(false)
  const [visible, setVisible] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [justReleased, setJustReleased] = useState<boolean>(false)

  const overlayRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const gestureRef = useRef<HTMLDivElement>(null)

  const openTime = useRef<Date | null>(null)
  const dragStartTime = useRef<Date | null>(null)
  const dragEndTime = useRef<Date | null>(null)
  const isAllowedToDrag = useRef<boolean>(false)
  const pointerStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const keyboardIsOpen = useRef(false)
  const previousDiffFromInitial = useRef(0)
  const draggingDirectionRef = useRef<'vertical' | 'horizontal' | 'initial'>(
    'initial',
  )
  const initialDrawerHeight = useRef(0)
  const prevDrawerRect = useRef<{ height: number; width: number }>({
    height: 0,
    width: 0,
  })
  const tappedRef = useRef(false)

  usePreventScroll({
    isDisabled: !isOpen || isDragging || justReleased || !hasBeenOpened,
  })

  const { restorePositionSetting } = usePositionFixed({
    isOpen,
    hasBeenOpened,
    preventScrollRestoration,
  })

  useEffect(() => {
    return () => {
      restorePositionSetting()
    }
  }, [restorePositionSetting])

  useEffect(() => {
    function onVisualViewportChange() {
      if (!contentRef.current || !containerRef.current || !gestureRef.current)
        return
      const { height, top, width } = contentRef.current.getBoundingClientRect()

      // check resize or keyboard open
      const visualViewportWidth = window.visualViewport?.width || 0

      // maybe resize
      if (visualViewportWidth !== width) {
        const { top } = containerRef.current.getBoundingClientRect()

        set(contentRef.current, {
          '--button-offset-top': `${-top}px`,
          '--window-width': `${window.innerWidth}px`,
          '--window-height': `${window.innerHeight}px`,
        })

        gestureRef.current.style.top = `calc(50% - 20px)`

        return
      }

      const focusedElement = document.activeElement as HTMLElement
      if (isInput(focusedElement) || keyboardIsOpen.current) {
        const visualViewportHeight = window.visualViewport?.height || 0
        // This is the height of the keyboard
        const diffFromInitial = window.innerHeight - visualViewportHeight

        if (!initialDrawerHeight.current) {
          initialDrawerHeight.current = height
        }

        const drawerHeight = height || 0
        const offsetFromTop = top

        // visualViewport height may change due to some subtle changes to the keyboard. Checking if the height changed by 60 or more will make sure that they keyboard really changed its open state.
        if (
          Math.abs(previousDiffFromInitial.current - diffFromInitial) > 60
          // && width === prevDrawerRect.current.width
        ) {
          keyboardIsOpen.current = !keyboardIsOpen.current
        }

        previousDiffFromInitial.current = diffFromInitial

        // We don't have to change the height if the input is in view, when we are here we are in the opened keyboard state so we can correctly check if the input is in view
        if (
          (drawerHeight > visualViewportHeight &&
            window.visualViewport?.width === width) ||
          keyboardIsOpen.current
        ) {
          // const height = height
          let newDrawerHeight = height

          if (height > visualViewportHeight) {
            newDrawerHeight = visualViewportHeight - WINDOW_TOP_OFFSET
          }
          const newHeight = Math.max(
            newDrawerHeight,
            visualViewportHeight - offsetFromTop,
          )
          contentRef.current.style.height = `${newHeight}px`
          gestureRef.current.style.top = `${newHeight / 2 - HALF_OF_ICON_SIZE}px`
        } else {
          contentRef.current.style.height = `${initialDrawerHeight.current}px`
          gestureRef.current.style.top = `${initialDrawerHeight.current / 2 - HALF_OF_ICON_SIZE}px`
        }

        prevDrawerRect.current = { height, width }
        // Negative bottom value would never make sense
        contentRef.current.style.bottom = `${Math.max(diffFromInitial, 0)}px`
      }
    }

    window.visualViewport?.addEventListener('resize', onVisualViewportChange)
    return () => {
      window.visualViewport?.removeEventListener(
        'resize',
        onVisualViewportChange,
      )
    }
  }, [])

  const cancelDrag = useCallback(() => {
    if (!isDragging || !contentRef.current) return

    contentRef.current.classList.remove(DRAG_CLASS)
    isAllowedToDrag.current = false
    setIsDragging(false)
    dragEndTime.current = new Date()
  }, [isDragging])

  const closeDrawer = useCallback(() => {
    if (!contentRef.current) return

    cancelDrag()

    onClose?.()

    const { DURATION, EASE } = TRANSITIONS.EXIT

    set(contentRef.current, {
      width: '100%',
      transform: `translate3d(-50%, 0, 0)`,
      transitionProperty: 'transform, width',
      transition: `${DURATION}ms cubic-bezier(${EASE.join(',')})`,
    })

    set(overlayRef.current, {
      opacity: '0',
      transition: `opacity ${DURATION}ms cubic-bezier(${EASE.join(',')})`,
    })

    set(gestureRef.current, {
      opacity: '0',
      transition: `opacity ${DURATION}ms cubic-bezier(${EASE.join(',')})`,
    })

    setTimeout(() => {
      setVisible(false)
      setIsOpen(false)
    }, DURATION)
  }, [onClose, cancelDrag])

  useEffect(() => {
    if (openProp) {
      setIsOpen(true)
      setHasBeenOpened(true)
    } else {
      closeDrawer()
    }
  }, [openProp])

  // This can be done much better
  useEffect(() => {
    if (mounted) {
      onOpenChange?.(isOpen)
    }
  }, [isOpen])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Trigger enter animation without using CSS animation
    if (isOpen) {
      set(document.documentElement, {
        scrollBehavior: 'auto',
      })

      openTime.current = new Date()
    }
  }, [isOpen])

  useEffect(() => {
    if (contentRef.current && visible) {
      // ドロワー内のスクロール可能な要素をすべて見つけ、クラスを割り当てて、ドラッグ時のオーバーフローを無効にし、ポインタ移動がキャプチャされないようにする。
      const children = contentRef?.current?.querySelectorAll('*')
      children?.forEach((child: Element) => {
        const htmlChild = child as HTMLElement
        if (
          htmlChild.scrollHeight > htmlChild.clientHeight ||
          htmlChild.scrollWidth > htmlChild.clientWidth
        ) {
          htmlChild.classList.add('search-dialog-scrollable')
        }
      })
    }
  }, [visible])

  const onPress = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dismissible) return
    if (
      contentRef.current &&
      !contentRef.current.contains(event.target as Node)
    )
      return
    setIsDragging(true)
    dragStartTime.current = new Date()

    // iOS doesn't trigger mouseUp after scrolling so we need to listen to touched in order to disallow dragging
    if (isIOS()) {
      window.addEventListener(
        'touchend',
        () => (isAllowedToDrag.current = false),
        { once: true },
      )
    }
    // Ensure we maintain correct pointer capture even when going outside of the drawer
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)

    pointerStart.current = { x: event.screenX, y: event.screenY }
    tappedRef.current = true
    draggingDirectionRef.current = 'initial'
  }

  const shouldDrag = (el: EventTarget) => {
    const element = el as HTMLElement

    if (
      element.hasAttribute('data-search-no-drag') ||
      element.closest('[data-search-no-drag]')
    ) {
      return false
    }

    return true
  }

  const onDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!contentRef.current) {
      return
    }
    // ドラッグ量に応じて背景を変換できるように、ドロワーのドラッグ量をパーセンテージで知る必要がある。
    if (isDragging) {
      tappedRef.current = false
      const directionMultiplier = -1
      const draggedDistance =
        (pointerStart.current.x - event.screenX) * directionMultiplier
      const isDraggingInDirection = draggedDistance > 0

      if (!isAllowedToDrag.current && !shouldDrag(event.target)) return

      // ドラッグの方向がy軸に対して40度未満の場合、ドラッグを許可しない。
      if (draggingDirectionRef.current === 'initial') {
        const angle = calculateAngleWithYAxis(pointerStart.current, {
          x: event.screenX,
          y: event.screenY,
        })
        if (angle < 60) {
          draggingDirectionRef.current = 'vertical'
          return
        } else {
          draggingDirectionRef.current = 'horizontal'
        }
      } else if (draggingDirectionRef.current === 'vertical') {
        return
      }

      // 一方向しかドラッグできないようにする
      if (isDraggingInDirection) return

      contentRef.current.classList.add(DRAG_CLASS)
      // ドロワーを押し下げた後shouldDragが一度でもtrueを返したら、isAllowedToDragをtrueに設定し、手を離すまでtrueのままにする。なぜならドラッグを途中で無効にする理由はない。
      isAllowedToDrag.current = true

      const dampenedDraggedDistance = dampenValue(Math.abs(draggedDistance))

      const translateValue = Math.max(dampenedDraggedDistance, 0)

      set(contentRef.current, {
        transition: 'none',
        transitionProperty: 'transform',
        transformOrigin: 'left calc(50% + var(--button-offset-top))',
        borderRadius: '8px',
        transform: `scale(${1 - translateValue / window.innerWidth}) translate3d(-50%, var(--button-offset-top), 0)`,
      })

      const NavigationSize = 40
      const translateX =
        clamp(0, translateValue, NavigationSize) - NavigationSize + 12

      set(gestureRef.current, {
        transform: `translate3d(${-translateX}px, 0, 0) scaleY(${1 - (translateValue * 1.2) / window.innerWidth})`,
        transition: 'none',
      })
    }
  }

  function resetDrawer() {
    if (!contentRef.current) return

    const { DURATION, EASE } = TRANSITIONS.ENTER

    set(contentRef.current, {
      transform: 'translate3d(-50%, var(--button-offset-top), 0)',
      transition: `transform ${DURATION}ms cubic-bezier(${EASE.join(',')})`,
      borderRadius: '0',
      transformOrigin: 'center',
    })

    set(gestureRef.current, {
      transform: `translate3d(100%, 0, 0)`,
      transition: `transform ${DURATION}ms cubic-bezier(${EASE.join(',')})`,
    })
  }

  const onRelease = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !contentRef.current) return

    contentRef.current.classList.remove(DRAG_CLASS)
    isAllowedToDrag.current = false
    setIsDragging(false)
    dragEndTime.current = new Date()
    const scaleAmount = getTranslateScale(contentRef.current)

    if (
      !shouldDrag(event.target) ||
      !scaleAmount ||
      Number.isNaN(scaleAmount)
    ) {
      return
    }
    if (dragStartTime.current === null) return

    const timeTaken =
      dragEndTime.current.getTime() - dragStartTime.current.getTime()
    const distMoved = pointerStart.current.x - event.screenX

    const velocity = Math.abs(distMoved) / timeTaken

    if (velocity > 0.05) {
      // justReleasedは、ドラッグが終了したときにドロワーが入力にフォーカスしないようにするために必要
      setJustReleased(true)

      setTimeout(() => {
        setJustReleased(false)
      }, 200)
    }

    // Moved upwards, don't do anything
    if (distMoved < 0) {
      resetDrawer()
      onReleaseProp?.(event, true, tappedRef.current)
      return
    }

    if (
      velocity > VELOCITY_THRESHOLD &&
      draggingDirectionRef.current === 'horizontal'
    ) {
      closeDrawer()
      onReleaseProp?.(event, false, tappedRef.current)
      return
    }

    const SCALE_THRESHOLD =
      1 - dampenValue(window.innerWidth * CLOSE_THRESHOLD) / window.innerWidth

    if (
      scaleAmount < SCALE_THRESHOLD &&
      draggingDirectionRef.current === 'horizontal'
    ) {
      closeDrawer()
      onReleaseProp?.(event, false, tappedRef.current)
      return
    }

    onReleaseProp?.(event, true, tappedRef.current)
    resetDrawer()
  }

  const contextValue = {
    overlayRef,
    containerRef,
    contentRef,
    onPress,
    onRelease,
    onDrag,
    dismissible,
    isOpen,
    keyboardIsOpen,
    closeDrawer,
    visible,
    setVisible,
    openProp,
    onOpenChange,
  } satisfies DialogContext

  return (
    <DialogPrimitive.Root
      modal={true}
      open={isOpen}
      onOpenChange={(o: boolean) => {
        if (openProp !== undefined) {
          onOpenChange?.(o)
          return
        }

        if (!o) {
          closeDrawer()
        } else {
          setHasBeenOpened(true)
          setIsOpen(o)
        }
      }}
    >
      <DialogContext.Provider value={contextValue}>
        {visible &&
          document.body &&
          createPortal(
            <div
              ref={gestureRef}
              search-dialog-gesture=''
            >
              <Icon
                name='arrow-back'
                size={24}
              />
            </div>,
            document.body,
          )}
        {children}
      </DialogContext.Provider>
    </DialogPrimitive.Root>
  )
}

const Overlay = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function Overlay({ children: _, ...props }, ref) {
  const { overlayRef, onRelease, visible } = useDialogContext()

  return (
    <DialogPrimitive.Overlay
      ref={mergeRefs([ref, overlayRef])}
      {...props}
      onMouseUp={onRelease}
      search-dialog-overlay=''
      search-dialog-visible={visible ? 'true' : 'false'}
    />
  )
})

type ContentProps = React.ComponentPropsWithoutRef<
  (typeof DialogPrimitive)['Content']
>

const Content = forwardRef<HTMLDivElement, ContentProps>(function Content(
  { onOpenAutoFocus, onPointerDownOutside, ...props },
  ref,
) {
  const {
    containerRef,
    contentRef,
    onPress,
    onRelease,
    onDrag,
    dismissible,
    keyboardIsOpen,
    visible,
    setVisible,
    closeDrawer,
    openProp,
    onOpenChange,
  } = useDialogContext()

  useEffect(() => {
    // Trigger enter animation without using CSS animation
    setVisible(true)

    if (!containerRef.current) return

    const { top } = containerRef.current.getBoundingClientRect()

    set(contentRef.current, {
      '--button-offset-top': `${-top}px`,
      '--window-width': `${window.innerWidth}px`,
      '--window-height': `${window.innerHeight}px`,
    })
  }, [setVisible, containerRef, contentRef])

  return (
    <DialogPrimitive.Content
      ref={mergeRefs([ref, contentRef])}
      {...props}
      search-dialog-root=''
      search-dialog-visible={visible ? 'true' : 'false'}
      onOpenAutoFocus={(e) => {
        if (onOpenAutoFocus) {
          onOpenAutoFocus(e)
        } else {
          e.preventDefault()
          contentRef.current?.focus()
        }
      }}
      onPointerDown={onPress}
      onPointerDownOutside={(e) => {
        onPointerDownOutside?.(e)
        if (e.defaultPrevented) {
          e.preventDefault()
          return
        }
        if (keyboardIsOpen.current) {
          keyboardIsOpen.current = false
        }
        e.preventDefault()
        onOpenChange?.(false)
        if (!dismissible || openProp !== undefined) {
          return
        }

        closeDrawer()
      }}
      onPointerMove={onDrag}
      onPointerUp={onRelease}
    />
  )
})

const Container = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  function Container({ children }, ref) {
    const { containerRef } = useDialogContext()

    return (
      <div
        className='relative h-14 w-full'
        ref={mergeRefs([ref, containerRef])}
      >
        {children}
      </div>
    )
  },
)

const TriggerWrapper = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>(function TriggerWrapper({ children, className }, ref) {
  const { isOpen } = useDialogContext()

  if (isOpen) return null

  return (
    <div
      ref={ref}
      className={className}
    >
      {children}
    </div>
  )
})

function Portal({
  container,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>) {
  const { containerRef } = useDialogContext()

  return (
    <DialogPrimitive.Portal
      container={container ?? containerRef.current}
      {...props}
    />
  )
}

const Close = DialogPrimitive.Close
const Trigger = DialogPrimitive.Trigger

export {
  Root,
  Content,
  Overlay,
  Container,
  TriggerWrapper,
  Portal,
  Trigger,
  Close,
}

function calculateAngleWithYAxis(
  {
    x: x1,
    y: y1,
  }: {
    x: number
    y: number
  },
  {
    x: x2,
    y: y2,
  }: {
    x: number
    y: number
  },
) {
  // Calculate the difference in y and x
  const dy = Math.abs(y2 - y1)
  const dx = Math.abs(x2 - x1)

  // Calculate the angle in radians between the line and the x-axis
  const angleRad = Math.atan2(dy, dx)

  // Convert the angle to be with respect to the y-axis
  const angleWithYAxisRad = Math.PI / 2 - angleRad

  // Convert radians to degrees
  const angleDeg = (angleWithYAxisRad * 180) / Math.PI

  // Ensure the angle is positive and within [0, 360])
  const positiveAngle = (angleDeg + 360) % 360

  return positiveAngle > 90 ? 180 - positiveAngle : positiveAngle
}

const { EXIT, ENTER } = TRANSITIONS

const items = [
  'Google Chrome',
  'Mozilla Firefox',
  'Opera',
  'Microsoft Edge',
  'Safari',
  'Chromium',
  'Waterfox',
  'Brave',
  'Tor',
  'Puffin',
  'FreeNet',
  'Vivaldi',
  'Epic',
]

const classes = ['outline-brand-6', 'outline']

const itemClasses =
  'flex items-center gap-8 p-4 text-base text-brand-12 data-[selected=true]:bg-brand-12/8 duration-200 transition-colors ease-s'

/**
 * <Root>
 *   <Trigger />
 *   <Content>
 *    {lists.map((item) => (
 *      <Item key={item}>{item}</Item>
 *    ))}
 *   </Content>
 * </Root>
 */

export function SearchDialog() {
  const [open, setOpen] = useState<boolean>(false)
  const [value, setValue] = useState('')
  const [candidates, setCandidates] = useState(() => items)

  const containeRef = useRef<HTMLDivElement | null>(null)
  const triggerWrapperRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const shouldSelectRef = useRef(true)

  const handleScrollEnd = useCallback(() => {
    if (!containeRef.current) return

    const elm = containeRef.current
    const padding = 12

    const { top, bottom, height } = elm.getBoundingClientRect()
    if (top >= 0 || bottom <= 0) return

    const displayMoreThanHalf = bottom > height / 2

    if (displayMoreThanHalf) {
      window.scrollBy({ left: 0, top: top - padding, behavior: 'smooth' })
      return
    }

    window.scrollBy({ left: 0, top: bottom + padding, behavior: 'smooth' })
  }, [])

  useScrollEnd(handleScrollEnd)

  useEffect(() => {
    window.addEventListener('resize', handleScrollEnd)

    return () => {
      window.removeEventListener('resize', handleScrollEnd)
    }
  }, [handleScrollEnd])

  return (
    <Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o)

        if (o) {
          setTimeout(() => {
            // calculate scrollable each animation makes frame janky. so, delay it
            set(contentRef.current, { overflowY: 'auto' })
          }, ENTER.DURATION + 50)
        }
      }}
      onRelease={(_e, _open, tapped) => {
        shouldSelectRef.current = tapped
      }}
      onClose={() => {
        set(headerRef.current, {
          height: '3.5rem',
          'border-top-right-radius': '8px',
          'border-top-left-radius': '8px',
          transition: `${EXIT.DURATION}ms cubic-bezier(${EXIT.EASE.join(',')})`,
        })

        set(contentRef.current, {
          overflowY: 'hidden',
          backgroundColor: 'hsl(var(--sand9))',
          clipPath: 'inset(0 0 100% 0)',
          transition: `${EXIT.DURATION}ms cubic-bezier(${EXIT.EASE.join(',')})`,
        })
      }}
    >
      <Container ref={containeRef}>
        <TriggerWrapper
          ref={triggerWrapperRef}
          className='absolute inset-x-1/2 top-0 flex h-14 w-full max-w-[45rem] -translate-x-1/2 items-center gap-4 rounded-full bg-brand-9 px-4'
        >
          <LeadingButton
            value={value}
            onClick={() => setValue('')}
          />
          <div className='flex h-full grow items-center'>
            <Trigger
              onFocus={() =>
                triggerWrapperRef.current?.classList.add(...classes)
              }
              onBlur={() =>
                triggerWrapperRef.current?.classList.remove(...classes)
              }
              className='inline-flex h-full grow select-none appearance-none items-center justify-start bg-transparent text-base text-brand-3 outline-none'
            >
              {value || 'メールを検索'}
            </Trigger>
          </div>
          <TrailingButton
            value={value}
            onClick={() => {
              setValue('')
              setOpen(true)
            }}
          />
        </TriggerWrapper>
        <Portal>
          <Overlay className='fixed inset-0 bg-black/32' />
          <Content
            className='flex flex-col outline-none'
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              // focus immediately makes animation janky
              setTimeout(() => {
                inputRef.current?.focus()
              }, ENTER.DURATION + 50)
            }}
            asChild
          >
            <Command label='Command Menu'>
              <div
                ref={headerRef}
                search-dialog-trigger=''
                data-search-no-drag=''
              >
                <IconButton
                  variant='ghost'
                  type='button'
                  onClick={() => setOpen(false)}
                  label='戻る'
                >
                  {open ? (
                    <Icon
                      name='arrow-back'
                      size={24}
                    />
                  ) : (
                    <Icon
                      name='menu'
                      size={24}
                    />
                  )}
                </IconButton>
                <Command.Input
                  value={value}
                  onValueChange={setValue}
                  ref={inputRef}
                  className='grow appearance-none bg-transparent text-base text-brand-12 outline-none placeholder:text-brand-11'
                  placeholder='メールを検索'
                />
                {value.length > 0 ? (
                  <IconButton
                    variant='ghost'
                    type='button'
                    onClick={() => {
                      setValue('')
                      inputRef.current?.focus()
                    }}
                    label='検索テキストを消去'
                  >
                    <Icon
                      name='close'
                      size={24}
                    />
                  </IconButton>
                ) : (
                  <IconButton
                    variant='ghost'
                    type='button'
                    onClick={() => {}}
                    label='音声検索を開始'
                  >
                    <Icon
                      name='mic-fill'
                      size={24}
                    />
                  </IconButton>
                )}
              </div>
              <div className='border-b border-brand-6' />
              <Command.List
                ref={contentRef}
                search-dialog-content=''
                className='grow overscroll-y-none py-2'
              >
                <Command.Group>
                  {value ? (
                    <Command.Item
                      onSelect={() => {
                        setOpen(false)
                        setTimeout(() => {
                          setCandidates((prev) => [
                            value,
                            ...prev.filter((v) => v !== value),
                          ])
                        }, EXIT.DURATION)
                      }}
                      className={itemClasses}
                    >
                      <Icon
                        name='manage-search'
                        size={18}
                      />
                      {`「${value}」を含むメールの検索`}
                    </Command.Item>
                  ) : (
                    <div className='p-4 text-base text-brand-11'>
                      最近行ったメール検索
                    </div>
                  )}
                  {candidates.map((candidate) => (
                    <Command.Item
                      key={candidate}
                      onSelect={() => {
                        if (!shouldSelectRef.current) return

                        setOpen(false)

                        setTimeout(() => {
                          setCandidates((prev) => [
                            candidate,
                            ...prev.filter((v) => v !== candidate),
                          ])
                          setValue(candidate)
                        }, EXIT.DURATION)
                      }}
                      className={itemClasses}
                    >
                      <Icon
                        name='history'
                        size={20}
                      />
                      {candidate}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </Content>
        </Portal>
      </Container>
    </Root>
  )
}

function LeadingButton({
  value,
  onClick,
}: {
  value: string
  onClick: () => void
}) {
  return value ? (
    <IconButton
      label='前に戻る'
      type='button'
      variant='ghost'
      size='sm'
      onClick={onClick}
    >
      <Icon
        name='arrow-back'
        size={20}
      />
    </IconButton>
  ) : (
    <IconButton
      label='ナビゲーションドロワーを開く'
      variant='ghost'
      size='sm'
    >
      <Icon
        name='menu'
        size={20}
      />
    </IconButton>
  )
}

function TrailingButton({
  value,
  onClick,
}: {
  value: string
  onClick: () => void
}) {
  return value ? (
    <IconButton
      label='検索テキストを消去'
      type='button'
      variant='ghost'
      size='sm'
      onClick={onClick}
    >
      <Icon
        name='close'
        size={20}
      />
    </IconButton>
  ) : (
    <IconButton
      label='caprolactamのアカウント'
      variant='filled'
      className='text-base'
      size='sm'
    >
      C
    </IconButton>
  )
}
