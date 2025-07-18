import { motion, AnimatePresence } from 'motion/react'
import type { HTMLMotionProps } from 'motion/react'
import React from 'react'
import { useIsMobile } from '@/lib/use-media-query.ts'
import { ThemePicker } from './theme/picker.tsx'

export const TITLE_ID = 'page-title'

const motionProps: Pick<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'exit'
> = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export function Header() {
  const isMobile = useIsMobile(false)
  const [show, setShow] = React.useState(false)
  const titleRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    const titleElement = document.getElementById(TITLE_ID)
    if (!titleElement) return

    titleRef.current = titleElement.textContent

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
      // Header height is 56px, so we set the root margin to -56px
      { rootMargin: '-56px 0px 0px 0px' },
    )
    intersectionObserver.observe(titleElement)

    return () => {
      intersectionObserver.disconnect()
    }
  }, [])

  const shouldSwtich = show && titleRef.current

  const goTop = (
    <motion.button
      // need unique key to framer-motion track the component
      key='go-top'
      {...motionProps}
      className='flex h-full min-w-0 flex-1 items-center justify-center'
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      tabIndex={-1}
      title='画面上部にスクロール'
    >
      <p className='text-brand-12 max-w-[26ch] truncate text-base font-semibold'>
        {titleRef.current}
      </p>
    </motion.button>
  )

  return (
    <motion.header
      className='sticky top-0 z-10 h-14 backdrop-blur-md'
      initial={false}
      animate={{
        backgroundColor: shouldSwtich
          ? 'color-mix(in oklab, var(--color-brand-1) 78%, transparent)'
          : 'var(--color-brand-1)',
      }}
    >
      <div className='mx-auto h-full w-full max-w-3xl px-4 md:px-6'>
        <div className='flex h-full flex-nowrap items-center justify-between gap-2'>
          {isMobile ? (
            <AnimatePresence
              mode='wait'
              initial={false}
            >
              {shouldSwtich && goTop}
              {!shouldSwtich && (
                <motion.div
                  // need unique key to framer-motion track the component
                  key='header-info'
                  {...motionProps}
                  className='flex size-full items-center justify-between gap-2'
                >
                  <HomepageIcon />
                  <ThemePicker />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <>
              <HomepageIcon />
              <AnimatePresence initial={false}>
                {shouldSwtich && goTop}
              </AnimatePresence>
              <ThemePicker />
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}

function HomepageIcon() {
  return (
    <a
      href='/'
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
    </a>
  )
}
