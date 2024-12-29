import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  motion,
  AnimatePresence,
  useSpring,
  useMotionValue,
  transform,
  LayoutGroup,
} from 'framer-motion'
import React from 'react'
import { Icon } from '#app/components/parts/icon.tsx'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '#app/components/parts/tooltip.tsx'
import { set, mergeRefs, cn } from '../utils/misc.ts'
import { isIOS } from '../utils/use-prevent-scroll.ts'

const NOT_SWIPABLE = 'data-card-no-swipe'
const SCROLL_LOCK_TIMEOUT = 100
const CLOSE_THRESHOLD = 0.15
const VELOCITY_THRESHOLD = 0.4
const WINDOW_TOP_OFFSET = 48

export function getNewOpacity({
  swipeAmount,
  containerHeight,
}: {
  swipeAmount: number
  containerHeight: number
}) {
  return transform(swipeAmount, [0, containerHeight * CLOSE_THRESHOLD], [1, 0])
}

type CardProps = CardInfo & {
  handleClick: () => void
  className: string | undefined
}

const DEFAULT_BLUR_TYPE = 'svg-filter'

function BlurredImage({
  src,
  alt,
  ...props
}: React.ComponentPropsWithoutRef<'img'>) {
  const { filterId, blurType } = useCardCotext()

  switch (blurType) {
    case 'filter': {
      return (
        <>
          <img
            {...props}
            src={src}
            alt={alt}
          />
          <img
            {...props}
            src={src}
            alt={alt}
            aria-hidden
            className={cn(props.className, 'blur-xl')}
            style={{
              clipPath: 'inset(calc(100% - 76px) 0 0 0)',
            }}
          />
        </>
      )
    }
    case 'backdrop-filter': {
      return (
        <img
          {...props}
          src={src}
          alt={alt}
        />
      )
    }
    case 'svg-filter': {
      return (
        <>
          <img
            {...props}
            src={src}
            alt={alt}
          />
          <img
            {...props}
            src={src}
            alt={alt}
            aria-hidden
            style={{
              clipPath: 'inset(calc(100% - 76px) 0 0 0)',
              filter: `url(#blur-card-${filterId})`,
            }}
          />
        </>
      )
    }
    default:
      throw new Error('Invalid blur type')
  }
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    title,
    description,
    imageUrl,
    citeUrl,
    imageAlt,
    imageCredit,
    handleClick,
    wide,
    className,
    detail: _,
    ...props
  },
  ref,
) {
  const { blurType } = useCardCotext()

  const scale = useSpring(1, {
    duration: 500,
  })

  return (
    <motion.div
      {...props}
      className={cn(
        wide ? 'aspect-video' : 'aspect-square',
        'dark relative flex items-end overflow-hidden rounded-lg text-brand-12',
        className,
      )}
      layoutId={`card-container-${title}`}
      transition={{
        type: 'spring',
        bounce: 0.2,
      }}
      style={{
        scale,
      }}
      ref={ref}
    >
      <BlurredImage
        src={imageUrl}
        alt={imageAlt}
        className='absolute inset-0 size-full object-cover'
      />
      <DialogPrimitive.Trigger asChild>
        <motion.button
          onClick={handleClick}
          type='button'
          onTapStart={() => scale.set(0.96)}
          onTap={() => scale.set(1)}
          onTapCancel={() => scale.set(1)}
          className='absolute inset-0 size-full rounded-lg text-start'
        >
          <span className='sr-only'>{`More info about the ${title}`}</span>
        </motion.button>
      </DialogPrimitive.Trigger>
      <div className='pointer-events-none relative grid w-full'>
        <div className='w-full p-4'>
          <div className='text-4xl font-bold text-brand-12'>{title}</div>
          <p className='text-sm'>{description}</p>
        </div>
        <div
          className={cn(
            'flex w-full min-w-0 justify-between gap-4 bg-black/5 p-4',
            blurType === 'backdrop-filter' && 'backdrop-blur-xl',
          )}
        >
          <div className='flex min-w-0 flex-col'>
            <p className='truncate text-base font-semibold'>{imageAlt}</p>
            <span className='block text-sm'>{`by ${imageCredit}`}</span>
          </div>
          <a
            href={citeUrl}
            rel='noreferrer noopener'
            className='pointer-events-auto flex h-10 shrink-0 items-center rounded-full bg-brand-12/20 px-6 py-2 text-sm font-semibold'
          >
            Get
          </a>
        </div>
      </div>
    </motion.div>
  )
})

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay(props, ref) {
  return (
    <DialogPrimitive.Overlay
      asChild
      ref={ref}
      {...props}
    >
      <motion.div
        variants={{
          closed: {
            background: 'rgba(0, 0, 0, 0)',
            backdropFilter: 'blur(0)',
            transition: {
              backdropFilter: {
                duration: 0,
              },
            },
          },
          open: {
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
          },
        }}
        initial='closed'
        animate='open'
        exit='closed'
        className='fixed inset-0'
      />
    </DialogPrimitive.Overlay>
  )
})

type DialogCardProps = Omit<
  React.ComponentPropsWithRef<typeof DialogPrimitive.Content>,
  'asChild' | 'onOpenAutoFocus'
> &
  CardInfo

const DialogCard = React.forwardRef<HTMLDivElement, DialogCardProps>(
  function DialogCard(
    {
      title,
      className,
      description,
      imageUrl,
      citeUrl,
      imageAlt,
      imageCredit,
      detail,
      wide,
      ...props
    },
    ref,
  ) {
    const { closeDialog, containerRef, blurType } = useCardCotext()

    const [isDragging, setIsDragging] = React.useState<boolean>(false)
    const openTime = React.useRef<Date | null>(null)
    const dragStartTime = React.useRef<Date | null>(null)
    const dragEndTime = React.useRef<Date | null>(null)
    const lastTimeDragPrevented = React.useRef<Date | null>(null)
    const isAllowedToDrag = React.useRef<boolean>(false)
    const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null)
    const containerHeightRef = React.useRef<number>(0)

    const drawerRef = React.useRef<HTMLDivElement | null>(null)
    const downloadRef = React.useRef<HTMLAnchorElement | null>(null)

    const mY = useSpring(0, {
      bounce: 0,
    })
    const mOpacity = useMotionValue(1)

    React.useEffect(() => {
      openTime.current = new Date()
    }, [])

    React.useEffect(() => {
      if (!drawerRef.current || !containerRef.current) return

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.contentRect.height

          set(containerRef.current, {
            height: `${height}px`,
          })

          containerHeightRef.current = height
        }
      })

      resizeObserver.observe(drawerRef.current)

      return () => {
        resizeObserver.disconnect()
      }
    }, [containerRef])

    function onPress(event: React.PointerEvent<HTMLDivElement>) {
      if (
        !drawerRef.current ||
        !drawerRef.current.contains(event.target as Node) ||
        !containerRef.current
      )
        return

      // prevent scroll except left button on mouse
      if (event.pointerType === 'mouse' && event.button !== 0) return

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
      // event.targetにsetPointerCaptureする場合、
      // 例えばp要素の親要素でのポインターの動きをキャプチャできないため、
      // テキスト選択が上手くいかないことがある
      // containerRefでsetするとdata-card-no-swipeが機能しない
      // containerRef.current.setPointerCapture(event.pointerId)
      ;(event.target as HTMLElement).setPointerCapture(event.pointerId)

      pointerStartRef.current = { x: event.screenX, y: event.screenY }
    }

    function shouldDrag(
      el: EventTarget,
      isDraggingInDirection: boolean,
      swipeAmount: number,
    ) {
      let element = el as HTMLElement
      const highlightedText = window.getSelection()?.toString()
      const date = new Date()

      if (
        element.hasAttribute(NOT_SWIPABLE) ||
        element.closest(`[${NOT_SWIPABLE}]`)
      ) {
        return false
      }

      // disallow scrolling when animating
      if (
        openTime.current &&
        date.getTime() - openTime.current.getTime() < 500
      ) {
        return false
      }

      if (swipeAmount > 0) {
        return true
      }

      // Don't drag if there's highlighted text
      if (highlightedText && highlightedText.length > 0) {
        return false
      }

      // Disallow dragging if drawer was scrolled within `scrollLockTimeout`
      if (
        lastTimeDragPrevented.current &&
        date.getTime() - lastTimeDragPrevented.current.getTime() <
          SCROLL_LOCK_TIMEOUT &&
        swipeAmount === 0
      ) {
        lastTimeDragPrevented.current = date
        return false
      }

      if (isDraggingInDirection) {
        lastTimeDragPrevented.current = date

        // We are dragging down so we should allow scrolling
        return false
      }

      // Keep climbing up the DOM tree as long as there's a parent
      while (element) {
        // Check if the element is scrollable
        if (element.scrollHeight > element.clientHeight) {
          if (element.scrollTop !== 0) {
            lastTimeDragPrevented.current = new Date()

            // The element is scrollable and not scrolled to the top, so don't drag
            return false
          }
        }

        if (element.getAttribute('role') === 'dialog') {
          return true
        }

        // Move up to the parent element
        element = element.parentNode as HTMLElement
      }

      // No scrollable parents not scrolled to the top found, so drag
      return true
    }

    function isDeltaInDirection(
      delta: { x: number; y: number },
      threshold = 0,
    ) {
      const deltaX = Math.abs(delta.x)
      const deltaY = Math.abs(delta.y)
      const isDeltaX = deltaX > deltaY

      return !isDeltaX && deltaY > threshold
    }

    function onDrag(event: React.PointerEvent<HTMLDivElement>) {
      if (!containerRef.current || !pointerStartRef.current) {
        return
      }
      // We need to know how much of the drawer has been dragged in percentages so that we can transform background accordingly
      if (isDragging) {
        const directionMultiplier = 1
        const draggedDistance =
          (pointerStartRef.current.y - event.screenY) * directionMultiplier
        const isDraggingInDirection = draggedDistance > 0
        const swipeAmount = mY.get() ?? 0

        if (
          !isAllowedToDrag.current &&
          !shouldDrag(event.target, isDraggingInDirection, swipeAmount)
        )
          return

        // If shouldDrag gave true once after pressing down on the drawer, we set isAllowedToDrag to true and it will remain true until we let go, there's no reason to disable dragging mid way, ever, and that's the solution to it
        isAllowedToDrag.current = true

        // Run this only if snapPoints are not defined or if we are at the last snap point (highest one)
        if (isDraggingInDirection) {
          return
        }

        const distMoved = Math.abs(draggedDistance)
        const translateValue = distMoved * directionMultiplier

        // const timeTaken = Date.now() - (dragStartTime.current?.getTime() ?? 0)
        // const velocity = distMoved / timeTaken
        // if (velocity > VELOCITY_THRESHOLD) {
        //   isAllowedToDrag.current = false
        //   setIsDragging(false)

        //   closeDrawer()
        //   onReleaseProp?.(event, false)
        //   return
        // }

        const visibleDrawerHeight = Math.max(containerHeightRef.current, 0)

        if (swipeAmount >= visibleDrawerHeight * CLOSE_THRESHOLD) {
          isAllowedToDrag.current = false
          setIsDragging(false)

          closeDrawer()
          return
        }

        mY.jump(translateValue)

        const newOpacity = getNewOpacity({
          swipeAmount: mY.get() ?? 0,
          containerHeight: visibleDrawerHeight,
        })

        mOpacity.set(newOpacity)
      }
    }

    function cancelDrag() {
      if (!isDragging) return

      isAllowedToDrag.current = false
      setIsDragging(false)
      dragEndTime.current = null
    }

    function onRelease(event: React.PointerEvent<HTMLDivElement>) {
      if (!isDragging || !containerRef.current) return

      isAllowedToDrag.current = false
      setIsDragging(false)
      dragEndTime.current = new Date()

      const swipeAmount = mY.get() ?? 0

      if (
        !shouldDrag(event.target, false, swipeAmount) ||
        !swipeAmount ||
        Number.isNaN(swipeAmount)
      ) {
        return
      }

      if (dragStartTime.current === null || !pointerStartRef.current) return

      const timeTaken =
        dragEndTime.current.getTime() - dragStartTime.current.getTime()
      const distMoved = pointerStartRef.current.y - event.screenY
      const velocity = Math.abs(distMoved) / timeTaken

      // if (velocity > 0.05) {
      //   // `justReleased` is needed to prevent the drawer from focusing on an input when the drag ends, as it's not the intent most of the time.
      //   setJustReleased(true)

      //   setTimeout(() => {
      //     setJustReleased(false)
      //   }, 200)
      // }

      function resetDrawer() {
        mY.set(0)
        // mOpacity motion化する
        mOpacity.set(1)
      }

      // Moved upwards, don't do anything
      if (distMoved > 0) {
        resetDrawer()
        return
      }

      if (velocity > VELOCITY_THRESHOLD) {
        closeDrawer()
        return
      }

      const visibleDrawerHeight = Math.min(
        containerRef.current.getBoundingClientRect().height,
        window.innerHeight - WINDOW_TOP_OFFSET,
      )

      if (swipeAmount >= visibleDrawerHeight * CLOSE_THRESHOLD) {
        closeDrawer()
        return
      }

      resetDrawer()
    }

    function closeDrawer() {
      cancelDrag()
      closeDialog()
    }

    return (
      <DialogPrimitive.Content
        {...props}
        ref={mergeRefs([ref, drawerRef])}
        className={cn(
          'fixed bottom-0 left-1/2 top-12 w-full max-w-2xl -translate-x-1/2 touch-none',
          className,
        )}
        aria-describedby={undefined}
        onPointerDown={onPress}
        onPointerMove={(e) => {
          if (!pointerStartRef.current) return null
          const yPosition = e.screenY - pointerStartRef.current.y
          const xPosition = e.screenX - pointerStartRef.current.x

          const clamp = Math.max

          const clampedX = 0
          const clampedY = clamp(0, yPosition)
          const swipeStartThreshold = e.pointerType === 'touch' ? 10 : 2
          const delta = { x: clampedX, y: clampedY }

          const isAllowedToSwipe = isDeltaInDirection(
            delta,
            swipeStartThreshold,
          )
          if (isAllowedToSwipe) onDrag(e)
          else if (
            Math.abs(xPosition) > swipeStartThreshold ||
            Math.abs(yPosition) > swipeStartThreshold
          ) {
            pointerStartRef.current = null
          }
        }}
        onPointerUp={(e) => {
          onRelease(e)

          pointerStartRef.current = null
        }}
        onOpenAutoFocus={(e) => {
          if (!downloadRef.current) return
          e.preventDefault()
          downloadRef.current.focus()
        }}
      >
        <motion.div
          className='dark relative aspect-video text-brand-12'
          layoutId={`card-container-${title}`}
          style={{
            y: mY,
          }}
        >
          <div
            className='absolute inset-x-0 top-0 flex h-full flex-col overflow-y-auto'
            ref={containerRef}
          >
            <div className='sticky top-0 z-10 -mt-12 flex h-12 w-full justify-end px-4 pt-4'>
              <TooltipProvider delayDuration={350}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogPrimitive.Close asChild>
                      <motion.button
                        style={{
                          opacity: mOpacity,
                        }}
                        data-card-no-swipe=''
                        className={cn([
                          'size-8 bg-brand-1/30 text-brand-12 before:hover:bg-brand-12/8 before:focus-visible:bg-brand-12/10 before:active:bg-brand-12/10 disabled:pointer-events-none disabled:text-brand-12/38',
                          'relative inline-flex shrink-0 select-none items-center justify-center rounded-full',
                          'before:absolute before:inset-0 before:rounded-full before:bg-transparent',
                        ])}
                      >
                        <Icon
                          name='close'
                          className='fill-current text-current'
                          size={24}
                        />
                        <div className='absolute inset-1/2 size-12 -translate-x-1/2 -translate-y-1/2' />
                        <div />
                      </motion.button>
                    </DialogPrimitive.Close>
                  </TooltipTrigger>
                  <TooltipContent>閉じる</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className='relative flex aspect-video shrink-0 items-end'>
              <BlurredImage
                src={imageUrl}
                alt={imageAlt}
                className={cn(
                  wide ? 'object-cover' : 'object-none',
                  'absolute inset-0 size-full bg-brand-2',
                )}
                // prevent dragging the image to enable us to swipe card.
                onPointerDown={(e) => e.preventDefault()}
              />
              <div className='relative grid w-full'>
                <div className='w-full p-4'>
                  <div className='text-4xl font-bold'>{title}</div>
                  <p className='text-sm text-brand-12/90'>{description}</p>
                </div>
                <div
                  className={cn(
                    'flex w-full min-w-0 justify-between gap-4 bg-black/5 p-4',
                    blurType === 'backdrop-filter' && 'backdrop-blur-xl',
                  )}
                >
                  <div className='flex min-w-0 flex-col'>
                    <DialogPrimitive.Title asChild>
                      <p className='truncate text-base font-semibold'>
                        {imageAlt}
                      </p>
                    </DialogPrimitive.Title>
                    <span className='block text-sm text-brand-12/90'>
                      {`by ${imageCredit}`}
                    </span>
                  </div>
                  <a
                    data-card-no-swipe=''
                    ref={downloadRef}
                    href={citeUrl}
                    rel='noreferrer noopener'
                    className='flex h-10 shrink-0 items-center rounded-full bg-brand-12/20 px-6 py-2 text-sm font-semibold'
                  >
                    Get
                  </a>
                </div>
              </div>
            </div>
            <motion.div
              className='shrink-0 grow bg-brand-2 p-6 text-base text-brand-11'
              variants={{
                closed: {
                  clipPath: 'inset(0 0 100% 0)',
                },
                open: {
                  clipPath: 'inset(0 0 0 0)',
                  transition: {
                    type: 'tween',
                    duration: 0.3,
                  },
                },
              }}
              initial='closed'
              animate='open'
              exit='closed'
            >
              <motion.div
                className='flex size-full flex-col items-start gap-6'
                variants={{
                  closed: {
                    opacity: 0,
                    transition: {
                      duration: 0,
                    },
                  },
                  open: {
                    opacity: 1,
                    transition: {
                      type: 'tween',
                      duration: 0.5,
                    },
                  },
                }}
                initial='closed'
                animate='open'
                exit='closed'
              >
                {detail}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </DialogPrimitive.Content>
    )
  },
)

type BlurType = 'filter' | 'backdrop-filter' | 'svg-filter'

type CardContextValue = {
  closeDialog: () => void
  containerRef: React.RefObject<HTMLDivElement>
  filterId: string
  /** @deprecated This params is only for article purposes. */
  blurType: BlurType
}
const CardContext = React.createContext<CardContextValue | undefined>(undefined)
const useCardCotext = () => {
  const context = React.useContext(CardContext)

  if (!context) {
    throw new Error('useCardCotext must be used within a CardProvider')
  }

  return context
}

export function CardList({
  cards,
  blurType,
}: {
  cards: CardInfo[]
  blurType?: BlurType
}) {
  const id = React.useId()

  const [picked, setPicked] = React.useState<string | null>(null)
  const pickedCard = cards.find((cardInfo) => cardInfo.title === picked)
  const open = !!pickedCard

  const containerRef = React.useRef<HTMLDivElement | null>(null)

  function closeDialog() {
    set(containerRef.current, {
      overflow: 'hidden',
    })
    setPicked(null)
  }

  return (
    <LayoutGroup id={id}>
      <DialogPrimitive.Root
        open={open}
        onOpenChange={(o) => {
          if (o) {
            // setOpen(o)
            return
          }

          closeDialog()
        }}
        modal
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width={0}
          height={0}
        >
          <filter id={`blur-card-${id}`}>
            <feGaussianBlur
              in='SourceGraphic'
              result='blur'
              stdDeviation={24}
            />
            <feComponentTransfer>
              <feFuncA
                type='table'
                tableValues={1}
              />
            </feComponentTransfer>
          </filter>
        </svg>
        <CardContext.Provider
          value={{
            closeDialog,
            containerRef,
            filterId: id,
            blurType: blurType ?? DEFAULT_BLUR_TYPE,
          }}
        >
          <div className='grid grid-cols-2 gap-4'>
            {cards.map((cardInfo) => (
              <Card
                key={cardInfo.title}
                {...cardInfo}
                handleClick={() => {
                  setPicked(cardInfo.title)
                }}
                className={cardInfo.wide ? 'col-span-2' : ''}
              />
            ))}
          </div>
          <AnimatePresence>
            {open ? (
              <DialogPrimitive.Portal forceMount>
                <DialogOverlay />
                <DialogCard {...pickedCard} />
              </DialogPrimitive.Portal>
            ) : null}
          </AnimatePresence>
        </CardContext.Provider>
      </DialogPrimitive.Root>
    </LayoutGroup>
  )
}

type CardInfo = {
  title: string
  description: string
  imageUrl: string
  imageAlt: string
  citeUrl: string
  imageCredit: string
  detail: React.ReactNode
  wide: boolean
}

export const cardInfos: Array<CardInfo> = [
  {
    title: 'Fox',
    description: 'What does the fox spot?',
    imageUrl: 'https://image.caproweb.com/images/uis-card-fox.avif',
    wide: true,
    citeUrl: 'https://unsplash.com/photos/brown-fox-on-snow-field-xUUZcpQlqpM',
    imageAlt: 'Brown fox on snow field.',
    imageCredit: 'Ray Hennessy',
    detail: (
      <>
        <div className='grid gap-6'>
          <p>
            {`Foxes are small to medium-sized, omnivorous mammals belonging to several genera of the family Canidae. They have a flattened skull, upright, triangular ears, a pointed, slightly upturned snout, and a long bushy tail ("brush").`}
          </p>
          <p>
            {`Twelve species belong to the monophyletic "true fox" group of genus Vulpes. Approximately another 25 current or extinct species are always or sometimes called foxes; these foxes are either part of the paraphyletic group of the South American foxes, or of the outlying group, which consists of the bat-eared fox, gray fox, and island fox.`}
            <sup className='ml-1'>{`[1]`}</sup>
          </p>
        </div>
        <div>
          <h4 className='font-semibold text-brand-12'>References</h4>
          <ol className='list-decimal'>
            <li
              id='cite-note-1'
              className='ml-4 py-1 text-sm'
            >
              <p>{`Macdonald, David W.; Sillero-Zubiri, Claudio, eds. (2004). The biology and conservation of wild canids (Nachdr. d. Ausg. 2004. ed.). Oxford: Oxford University Press. p. 49. ISBN 978-0198515562.`}</p>
            </li>
          </ol>
        </div>
      </>
    ),
  },
  {
    title: 'Hawk',
    description: 'Silent Watcher in the Snow',
    imageUrl: 'https://image.caproweb.com/images/uis-card-hawk.avif',
    wide: false,
    citeUrl:
      'https://unsplash.com/photos/a-close-up-of-a-bird-of-prey-SIYmu7jajf0',
    imageAlt: 'A close up of a bird of prey.',
    imageCredit: 'Zdeněk',
    detail: (
      <>
        <div className='grid gap-6'>
          <p>
            {`Hawks are birds of prey of the family Accipitridae. They are very widely distributed and are found on all continents except Antarctica.`}
            <sup className='ml-1'>{`[1]`}</sup>
          </p>
          <p>
            {`The subfamily Accipitrinae includes goshawks, sparrowhawks, sharp-shinned hawks, and others. This subfamily are mainly woodland birds with short broad wings, long tails, and high visual acuity. They hunt by dashing suddenly from a concealed perch.`}
            <sup className='ml-1'>{`[2]`}</sup>
          </p>
        </div>
        <div>
          <h4 className='font-semibold text-brand-12'>References</h4>
          <ol className='list-decimal'>
            <li
              id='cite-note-1'
              className='ml-4 py-1 text-sm'
            >
              <p>{`"hawk | Types, Diet, & Facts | Britannica". www.britannica.com. Retrieved 2022-07-25.`}</p>
            </li>
            <li
              id='cite-note-2'
              className='ml-4 py-1 text-sm'
            >
              <p>{`Campbell, B., Lack.E (2013) A Dictionary of Birds. p.273`}</p>
            </li>
          </ol>
        </div>
      </>
    ),
  },
  {
    title: 'Bee-eater',
    description: `Nature's Harmony in Colors`,
    imageUrl: 'https://image.caproweb.com/images/uis-card-bee-eater.avif',
    wide: false,
    citeUrl:
      'https://unsplash.com/photos/a-green-bird-sitting-on-top-of-a-tree-branch-7KzGvzdws4E',
    imageAlt: 'A green bird sitting on top of a treebranch.',
    imageCredit: 'Khushi Gandhi',
    detail: (
      <div className='grid gap-6'>
        <p>
          {`The bee-eaters are a group of birds in the family Meropidae, containing three genera and thirty species. Most species are found in Africa and Asia, with a few in southern Europe, Australia, and New Guinea. They are characterised by richly coloured plumage, slender bodies, and usually elongated central tail feathers. All have long down-turned bills and medium to long wings, which may be pointed or round. Male and female plumages are usually similar.`}
        </p>
        <p>
          {`As their name suggests, bee-eaters predominantly eat flying insects, especially bees and wasps, which are caught on the wing from an open perch. The insect's stinger is removed by repeatedly hitting and rubbing the insect on a hard surface. During this process, pressure is applied to the insect's body, thereby discharging most of the venom.`}
        </p>
      </div>
    ),
  },
]
