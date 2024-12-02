import * as Popover from '@radix-ui/react-popover'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useState, useRef } from 'react'
import { z } from 'zod'
import { IconButton } from '#app/components/parts/icon-button.tsx'
import { Icon } from '#app/components/parts/icon.tsx'
import { strictEntries } from './misc.ts'

const themeSchema = z.enum(['system', 'light', 'dark'])

type Theme = z.infer<typeof themeSchema>

export function ThemePicker() {
  const { theme: t, setTheme } = useTheme()
  let theme: Theme
  const parsed = themeSchema.safeParse(t)
  if (parsed.success) {
    theme = parsed.data
  } else {
    theme = 'system'
  }
  const [open, setOpen] = useState(false)

  const themes: Record<
    Theme,
    {
      label: string
      icon: React.JSX.Element
    }
  > = {
    system: {
      label: 'システム',
      icon: (
        <Icon
          name='desktop-windows'
          size={24}
        />
      ),
    },
    light: {
      label: 'ライト',
      icon: (
        <Icon
          name='light-mode'
          size={24}
        />
      ),
    },
    dark: {
      label: 'ダーク',
      icon: (
        <Icon
          name='dark-mode'
          size={24}
        />
      ),
    },
  }

  const itemsRef = useRef<Map<Theme, HTMLButtonElement>>()

  function getMap() {
    if (!itemsRef.current) {
      // Initialize the Map on first usage.
      itemsRef.current = new Map() as Map<Theme, HTMLButtonElement>
    }
    return itemsRef.current
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={setOpen}
    >
      <Popover.Trigger asChild>
        <IconButton
          variant='ghost'
          size='lg'
          label='テーマ'
        >
          {themes[theme].icon}
        </IconButton>
      </Popover.Trigger>
      <AnimatePresence>
        {open && (
          <Popover.Portal forceMount>
            <Popover.Content
              sideOffset={5}
              align='end'
              onOpenAutoFocus={(e) => {
                const items = getMap()
                const item = items.get(theme)

                if (item) {
                  e.preventDefault()
                  item.focus()
                }
              }}
              asChild
            >
              <motion.div
                className='w-48 rounded-sm border bg-brand-3 py-2 text-brand-12 shadow-md'
                initial='closed'
                animate='open'
                exit='closed'
                variants={{
                  closed: {
                    clipPath: 'inset(0 0 100% 0)',
                    opacity: 0,
                    transition: {
                      type: 'tween',
                      ease: [0.3, 0, 0, 1],
                      duration: 0.2,
                    },
                  },
                  open: {
                    clipPath: 'inset(0 0 0 0)',
                    opacity: 1,
                    transition: {
                      clipPath: {
                        type: 'tween',
                        ease: [0.3, 0, 0, 1],
                        duration: 0.3,
                      },
                      opacity: {
                        type: 'tween',
                        duration: 0.3,
                      },
                    },
                  },
                }}
              >
                <RadioGroup.Root
                  className='flex flex-col'
                  defaultValue={theme}
                  aria-label='サイトのテーマ'
                >
                  {strictEntries(themes).map(([key, value]) => (
                    <RadioGroup.Item
                      key={key}
                      className='relative flex h-12 cursor-default select-none items-center gap-3 px-3 text-sm outline-none hover:bg-brand-4 focus-visible:bg-brand-4 data-[disabled]:pointer-events-none'
                      value={key}
                      type='button'
                      onClick={(e) => {
                        e.preventDefault()
                        setTheme(key)
                      }}
                      ref={(node) => {
                        const map = getMap()
                        if (node) {
                          map.set(key, node)
                        } else {
                          map.delete(key)
                        }
                      }}
                    >
                      {themes[key].icon}

                      <span className='grow text-start'>{value.label}</span>

                      <span className='flex items-center justify-center'>
                        {theme === key && (
                          <Icon
                            size={24}
                            name='check'
                          />
                        )}
                      </span>
                    </RadioGroup.Item>
                  ))}
                </RadioGroup.Root>
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  )
}
