import { cva } from 'class-variance-authority'
import type React from 'react'
import { cn } from '@/lib/utils.ts'
import { Icon } from './icon.tsx'

const filterChipVariants = cva(
  [
    'group border-brand-7 text-brand-12 hover:bg-brand-4 active:bg-brand-5 relative inline-flex h-8 appearance-none items-center gap-2 rounded-lg border pr-4 pl-4 text-sm font-medium whitespace-nowrap data-[state=checked]:pl-2',
    'disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50',
    'before:absolute before:inset-x-0 before:inset-y-1/2 before:h-10 before:-translate-y-1/2',
  ],
  {
    variants: {
      checked: {
        true: 'bg-brand-5',
        false: 'bg-brand-1',
      },
    },
    defaultVariants: {
      checked: false,
    },
  },
)

interface FilterChipLinkProps extends React.ComponentPropsWithRef<'a'> {
  checked?: boolean
  disabled?: boolean
}

export function FilterChipLink({
  checked = false,
  disabled = false,
  children,
  className,
  ...props
}: FilterChipLinkProps) {
  return (
    <a
      {...props}
      className={cn(
        filterChipVariants({
          checked,
        }),
        className,
      )}
      data-state={checked ? 'checked' : 'unchecked'}
      data-disabled={disabled ? '' : undefined}
      aria-disabled={disabled ? 'true' : undefined}
    >
      <Icon
        data-slot='filter-chip-indicator'
        name='check'
        className='group-data-[state=unchecked]:hidden'
        size={18}
      ></Icon>
      {children}
    </a>
  )
}
