import { Slot } from '@radix-ui/react-slot'
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion'
import React from 'react'
import { Link } from 'react-router'
import { useIsMobile } from '#app/utils/media-query.ts'
import { ThemePicker } from '#app/utils/theme.tsx'

const AppBarContext = React.createContext<
  | {
      titleRef: React.RefObject<HTMLDivElement>
      title: string
      setTitle: React.Dispatch<React.SetStateAction<string>>
    }
  | undefined
>(undefined)
export const AppBarProvider = ({ children }: { children: React.ReactNode }) => {
  const titleRef = React.useRef<HTMLDivElement>(null)
  const [title, setTitle] = React.useState('')

  return (
    <AppBarContext.Provider value={{ titleRef, title, setTitle }}>
      {children}
    </AppBarContext.Provider>
  )
}

export const useAppBar = () => {
  const context = React.useContext(AppBarContext)
  if (context === undefined) {
    throw new Error('useAppBar must be used within a AppBarProvider')
  }
  return context
}

export function AppBar() {
  const { titleRef, title } = useAppBar()
  const [show, setShow] = React.useState(false)
  const isMobile = useIsMobile()

  React.useEffect(() => {
    if (titleRef.current == null) return

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (entry == null) return

        if (entry.isIntersecting) {
          setShow(false)
        } else {
          setShow(true)
        }
      },
      { rootMargin: '-56px 0px 0px 0px' },
    )
    intersectionObserver.observe(titleRef.current)

    return () => {
      intersectionObserver.disconnect()
    }
  }, [titleRef])

  const motionProps: Pick<
    HTMLMotionProps<'div'>,
    'initial' | 'animate' | 'exit'
  > = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  const homepageIcon = (
    <Link
      to='/'
      className='relative inline-flex h-10 shrink-0 items-center gap-1.5 text-base font-medium'
      title='ホーム'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 200 200'
        fill='none'
        className='size-4'
      >
        <circle
          cx='100'
          cy='100'
          r='100'
          className='fill-[#2b9a66] dark:fill-[#33b074]'
        />
      </svg>
      Capro Web
      <div className='absolute inset-y-1/2 h-12 w-full -translate-y-1/2' />
    </Link>
  )

  const goTop = (
    <motion.button
      type='button'
      className='flex h-full min-w-0 flex-1 items-center justify-center'
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      // フォーカスが当たった時点で画面上部にいるので必要ない
      tabIndex={-1}
      aria-hidden
      title='画面上部にスクロール'
      {...motionProps}
    >
      <p className='max-w-[26ch] truncate text-base font-semibold text-brand-12'>
        {title}
      </p>
    </motion.button>
  )

  const themePicker = (
    <div className='shrink-0'>
      <ThemePicker />
    </div>
  )

  const shouldSwtich = show && title.length

  return (
    <motion.header
      className='sticky top-0 z-10 mx-auto h-14 w-full max-w-3xl px-4 backdrop-blur-md md:px-6'
      initial={false}
      animate={{
        backgroundColor: shouldSwtich
          ? 'hsl(var(--sand1) / 0.7)'
          : 'hsl(var(--sand1) / 1)',
      }}
    >
      <div className='flex h-full flex-nowrap items-center justify-between gap-2'>
        {isMobile ? (
          <AnimatePresence
            mode='wait'
            initial={false}
          >
            {shouldSwtich ? (
              goTop
            ) : (
              <motion.div
                {...motionProps}
                className='flex size-full items-center justify-between gap-2'
              >
                {homepageIcon}
                {themePicker}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <>
            {homepageIcon}
            <AnimatePresence initial={false}>
              {shouldSwtich && goTop}
            </AnimatePresence>
            {themePicker}
          </>
        )}
      </div>
    </motion.header>
  )
}

export function AppBarTitle({
  children,
  title,
  asChild = false,
  ...props
}: {
  children: React.ReactNode
  title?: string
  asChild?: boolean
} & React.ComponentPropsWithoutRef<'h2'>) {
  const Comp = asChild ? Slot : 'h2'
  const { titleRef, setTitle } = useAppBar()

  React.useEffect(() => {
    const t = title ?? children
    if (typeof t !== 'string') {
      throw new Error(
        'AppBarTitle must have a title prop or children must be a string',
      )
    }

    setTitle(t)
  }, [title, children, setTitle])

  return (
    <Comp
      {...props}
      ref={titleRef}
    >
      {children}
    </Comp>
  )
}
