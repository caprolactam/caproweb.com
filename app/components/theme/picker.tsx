import { AnimatePresence, motion } from 'motion/react'
import type React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { Icon } from '@/components/ui/icon.tsx'
import { useHydrated } from '@/lib/use-hydrated.ts'
import { strictEntries } from '@/lib/utils.ts'
import { useTheme, setTheme, isTheme } from './store.ts'
import type { ResolvedTheme, Theme } from './store.ts'

const themes: Record<
  Theme,
  {
    label: string
    icon: React.ReactNode
  }
> = {
  system: {
    label: 'システム',
    icon: (
      <Icon
        name='computer'
        size={18}
      />
    ),
  },
  light: {
    label: 'ライト',
    icon: (
      <Icon
        name='light-mode'
        size={20}
      />
    ),
  },
  dark: {
    label: 'ダーク',
    icon: (
      <Icon
        name='dark-mode'
        size={20}
      />
    ),
  },
}

export function ThemePicker() {
  const { theme, resolvedTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          aria-label='テーマの変更'
          variant='ghost'
        >
          <ThemeIcon resolvedTheme={resolvedTheme} />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={4}
      >
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => {
            if (!isTheme(value)) return

            setTheme(value)
          }}
        >
          {strictEntries(themes).map(([value, { label }]) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
            >
              <div className='flex-1'>{label}</div>
              {themes[value].icon}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ThemeIcon({ resolvedTheme }: { resolvedTheme: ResolvedTheme }) {
  const isHydrated = useHydrated()

  // ハイドレーション前はcssでアイコンの表示を切り替える
  if (!isHydrated)
    return (
      <>
        <div className='hidden dark:inline-flex'>{themes['dark'].icon}</div>
        <div className='inline-flex dark:hidden'>{themes['light'].icon}</div>
      </>
    )

  return (
    <AnimatePresence
      mode='wait'
      initial={false}
    >
      <motion.div
        key={resolvedTheme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { ease: 'easeOut', duration: 0.4 } }}
        exit={{ opacity: 0, transition: { ease: 'easeOut', duration: 0.2 } }}
        className='inline-flex'
      >
        {themes[resolvedTheme].icon}
      </motion.div>
    </AnimatePresence>
  )
}
