import { useIsMobile } from '#app/lib/use-media-query.ts'
import { motion, AnimatePresence } from 'motion/react'
import type { HTMLMotionProps } from 'motion/react'
import React from 'react'
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
            <AnimatePresence mode='wait' initial={false}>
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
        viewBox='0 0 100 100'
        width={20}
        height={20}
      >
        <circle
          cx='50'
          cy='50'
          r='48'
          stroke-width='1.5'
          stroke='#0066b3'
          fill='white'
        />
        <circle cx='50' cy='50' r='43' stroke-width='0' fill='#0066b3' />
        <path
          d='
      M 81.113,27.373
      L 47.172,61.314
      Q 82.527,65.556
        23.130,76.870
      Q 34.444,17.473
        38.686,52.828
      L 72.627,18.887
      Z
    '
          stroke-width='0'
          fill='white'
        />
      </svg>
      Capro Web
      <div className='absolute inset-y-1/2 h-12 w-full -translate-y-1/2' />
    </a>
  )
}
