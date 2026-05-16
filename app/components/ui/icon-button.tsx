import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { useState, useEffect } from 'react'
import { usePrefersReducedMotion } from '#app/lib/prefers-reduced-motion.ts'
import { cn } from '#app/lib/utils.ts'

const iconButtonVariants = cva(
  [
    // base
    'text-brand-12 disabled:bg-brand-4 disabled:text-brand-9 relative inline-flex shrink-0 items-center justify-center rounded-full select-none disabled:pointer-events-none',
    // touch target
    'before:absolute before:inset-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-brand-5 hover:bg-brand-6 focus-visible:bg-brand-7 active:bg-brand-7',
        outline:
          'border-brand-7 hover:border-brand-8 hover:bg-brand-4 focus-visible:bg-brand-5 active:bg-brand-5 border',
        ghost: 'hover:bg-brand-4 focus-visible:bg-brand-5 active:bg-brand-5',
      },
      size: {
        sm: 'size-8',
        md: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

interface IconButtonProp
  extends
    Omit<React.ComponentPropsWithRef<'button'>, 'children'>,
    VariantProps<typeof iconButtonVariants> {
  label: string
  timing?: number
  children: React.ReactNode | ((isBooped: boolean) => React.ReactNode)
}

function IconButton({
  size,
  variant,
  className,
  children,
  label,
  timing = 150,
  onMouseEnter,
  ...props
}: IconButtonProp) {
  const [isBooped, setIsBooped] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(
    function cleanupBoop() {
      if (!isBooped) {
        return
      }

      const timeoutId = window.setTimeout(() => {
        setIsBooped(false)
      }, timing)

      return () => {
        window.clearTimeout(timeoutId)
      }
    },
    [isBooped, timing],
  )

  return (
    <button
      {...props}
      className={cn(
        iconButtonVariants({
          size,
          variant,
        }),
        className,
      )}
      onMouseEnter={(event) => {
        if (!prefersReducedMotion) {
          setIsBooped(true)
        }

        onMouseEnter?.(event)
      }}
    >
      {typeof children === 'function' ? children(isBooped) : children}
      <span className='sr-only'>{label}</span>
    </button>
  )
}

export { IconButton, iconButtonVariants }
