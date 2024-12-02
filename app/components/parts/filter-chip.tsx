import * as Checkbox from '@radix-ui/react-checkbox'
import { cva } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { cn } from '#app/utils/misc.ts'

const filterChipVariants = cva(
  [
    'group relative inline-flex h-8 select-none appearance-none items-center rounded-lg border border-brand-7 pl-2 pr-4 text-sm text-brand-12 hover:bg-brand-4 active:bg-brand-5',
    'disabled:pointer-events-none disabled:border-brand-12/12 disabled:bg-brand-12/12 disabled:text-brand-12/38',
    'before:absolute before:inset-x-0 before:inset-y-1/2 before:h-10 before:-translate-y-1/2',
  ],
  {
    variants: {
      selected: {
        true: 'bg-brand-3',
        false: 'bg-brand-1',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

export function FilterChip({
  value,
  selected,
  disabled = false,
  onSelect,
  children,
  className,
}: {
  selected: boolean
  onSelect?: (checked: boolean) => void
  children?: React.ReactNode
  value: string
  className?: string
  disabled?: boolean
}) {
  return (
    <Checkbox.Root
      className={cn(
        filterChipVariants({
          selected,
        }),
        className,
      )}
      checked={selected}
      onCheckedChange={(checked) => {
        if (checked === 'indeterminate') {
          onSelect?.(false)
        } else {
          onSelect?.(checked)
        }
      }}
      disabled={disabled}
      name='filter'
      value={value}
    >
      <Checkbox.Indicator
        forceMount
        asChild
      >
        <motion.svg
          className='inline shrink-0 fill-current stroke-brand-12 object-contain text-transparent group-disabled:stroke-brand-12/38'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 600 600'
          layout
          initial={false}
          animate={selected ? 'selected' : 'unselected'}
          variants={{
            selected: {
              width: 18,
            },
            unselected: {
              width: 0,
            },
          }}
          style={{
            height: 18,
          }}
          transition={{
            type: 'spring',
            bounce: 0,
            duration: 0.2,
          }}
        >
          <motion.polyline
            variants={{
              selected: {
                pathLength: 1,
                opacity: 1,
                transition: {
                  pathLength: {
                    type: 'spring',
                    duration: 0.2,
                    bounce: 0,
                  },
                  opacity: { duration: 0.1 },
                },
              },
              unselected: {
                pathLength: 0,
                opacity: 0,
              },
            }}
            initial={false}
            points='130,316 230,416 470,176'
            strokeWidth='45'
            strokeLinecap='round'
          />
        </motion.svg>
      </Checkbox.Indicator>
      <span className='pl-2'>{children}</span>
    </Checkbox.Root>
  )
}

export function FilterChipLink({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(filterChipVariants({ selected: false }), className)}
    >
      <span className='pl-2'>{children}</span>
    </Link>
  )
}
