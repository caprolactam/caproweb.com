import * as Popover from '@radix-ui/react-popover'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useState, useRef } from 'react'
import { z } from 'zod'
import { IconButton } from '#app/components/parts/icon-button.tsx'
import { Icon } from '#app/components/parts/icon.tsx'
import { strictEntries, cn } from './misc.ts'

const themes = ['system', 'light', 'dark'] as const
const themeSchema = z.enum(themes)
type Theme = z.infer<typeof themeSchema>

/**
 * 行の先にあるアイテムから後にあるアイテムに移動する場合, 'up'
 * 行の後にあるアイテムから先にあるアイテムに移動する場合, 'down'
 */
function getDirection(prev: Theme, next: Theme) {
  const prevIndex = themes.indexOf(prev)
  const nextIndex = themes.indexOf(next)

  if (prevIndex < nextIndex) return 'up'
  return 'down'
}

const useTypedTheme = () => {
  const { theme, setTheme } = useTheme()
  const parsed = themeSchema.safeParse(theme)

  return [parsed.success ? parsed.data : 'system', setTheme] as const
}

export function ThemePicker() {
  const [theme, setTheme] = useTypedTheme()
  const [open, setOpen] = useState(false)
  const prevTheme = useRef<Theme>(theme)
  const itemsRef = useRef<Map<Theme, HTMLButtonElement | null>>(null)
  function getMap() {
    if (!itemsRef.current) {
      itemsRef.current = new Map() as Map<Theme, HTMLButtonElement>
    }
    return itemsRef.current
  }

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
          <AnimatePresence
            initial={false}
            mode='wait'
            custom={getDirection(prevTheme.current, theme)}
          >
            <motion.div
              key={theme}
              variants={{
                enter: {
                  opacity: 0,
                  y:
                    getDirection(prevTheme.current, theme) === 'down'
                      ? '-100%'
                      : '100%',
                  transition: {
                    duration: 0.2,
                    ease: [0.215, 0.61, 0.355, 1],
                  },
                },
                visible: { opacity: 1, y: 0 },
                exit: (direction: ReturnType<typeof getDirection>) => ({
                  opacity: 0,
                  y: direction === 'down' ? '100%' : '-100%',
                  transition: {
                    duration: 0.15,
                    ease: [0.215, 0.61, 0.355, 1],
                  },
                }),
              }}
              initial='enter'
              animate='visible'
              exit='exit'
            >
              {themes[theme].icon}
            </motion.div>
          </AnimatePresence>
        </IconButton>
      </Popover.Trigger>
      <Popover.Content
        sideOffset={5}
        align='end'
        side='bottom'
        onOpenAutoFocus={(e) => {
          const items = getMap()
          const item = items.get(theme)

          if (item) {
            e.preventDefault()
            item.focus({ preventScroll: true })
          }
        }}
        className={cn(
          'w-48 rounded-md border border-brand-7 bg-brand-3 text-brand-12 shadow-sm',
          // 'data-[state=open]:duration-300 origin-top-right',
          'origin-top-right ease-ease-out-cubic data-[state=closed]:duration-150 data-[state=open]:duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-[0.87]',
        )}
      >
        <RadioGroup.Root
          className='flex flex-col py-2'
          value={theme}
          onValueChange={(v) => {
            if (themeSchema.safeParse(v).success) {
              prevTheme.current = theme
              setTheme(v)
            }
          }}
          aria-label='サイトのテーマ'
        >
          {strictEntries(themes).map(([key, value]) => (
            <RadioGroup.Item
              key={key}
              className='flex h-12 cursor-default select-none items-center gap-3 px-3 text-sm outline-none transition-colors ease-linear hover:bg-brand-4 focus-visible:bg-brand-5 active:bg-brand-5 data-[disabled]:pointer-events-none data-[disabled]:text-brand-12/38'
              value={key}
              type='button'
              ref={(node) => {
                const map = getMap()

                map.set(key, node)
                return () => {
                  map.delete(key)
                }
              }}
            >
              {themes[key].icon}
              <span className='grow text-start'>{value.label}</span>
              {theme === key && (
                <Icon
                  size={24}
                  name='check'
                />
              )}
            </RadioGroup.Item>
          ))}
        </RadioGroup.Root>
      </Popover.Content>
    </Popover.Root>
  )
}
