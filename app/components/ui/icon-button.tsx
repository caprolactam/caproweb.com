import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils.ts'

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
  extends Omit<React.ComponentPropsWithRef<'button'>, 'aria-abel'>,
    VariantProps<typeof iconButtonVariants> {
  'aria-label': string
  asChild?: boolean
}

function IconButton({
  size,
  variant,
  className,
  children,
  asChild = false,
  ...props
}: IconButtonProp) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      {...props}
      className={cn(
        iconButtonVariants({
          size,
          variant,
        }),
        className,
      )}
    >
      {children}
    </Comp>
  )
}

export { IconButton, iconButtonVariants }
