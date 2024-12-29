import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'
import { cn } from '#app/utils/misc.ts'

const cardVariants = cva('', {
  variants: {
    padding: {
      sm: 'p-2',
      md: 'p-2 md:p-4',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
})

interface CardProps
  extends React.ComponentPropsWithoutRef<typeof Slot>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

export const Card = React.forwardRef<React.ElementRef<'div'>, CardProps>(
  ({ className, padding, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'

    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ padding }), className)}
        {...props}
      />
    )
  },
)

export function ShowcaseCard({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <Card
      {...props}
      padding='md'
      className={cn('not-prose my-[1.25em] rounded-md bg-brand-2', className)}
    >
      {children}
    </Card>
  )
}
