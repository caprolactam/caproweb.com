import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { Link as RemixLink } from 'react-router'
import { cn } from '#app/utils/misc.ts'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './tooltip.tsx'

export const iconButtonVariants = cva(
  [
    // base
    'relative inline-flex shrink-0 select-none items-center justify-center rounded-full text-brand-12',
    'before:absolute before:inset-0 before:rounded-full before:bg-transparent',
    'before:hover:bg-brand-12/8 before:focus-visible:bg-brand-12/10 before:active:bg-brand-12/10',
  ],
  {
    variants: {
      size: {
        sm: 'size-8',
        md: 'size-9',
        lg: 'size-10',
      },
      elementType: {
        button:
          'disabled:pointer-events-none disabled:bg-brand-12/12 disabled:text-brand-12/38',
        link: '',
      },
      variant: {
        filled: 'bg-brand-3',
        ghost: '',
      },
    },
    defaultVariants: {
      size: 'lg',
      variant: 'filled',
    },
  },
)

type IconButtonProp = React.ComponentPropsWithRef<'button'> &
  Omit<VariantProps<typeof iconButtonVariants>, 'elementType'> & {
    label: string
  }

const IconButton = forwardRef<HTMLButtonElement, IconButtonProp>(
  function IconButton(
    {
      disabled,
      label,
      size,
      type = 'button',
      variant,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <TooltipProvider delayDuration={350}>
        <Tooltip>
          <TooltipTrigger
            ref={ref}
            {...props}
            className={cn(
              iconButtonVariants({
                elementType: 'button',
                size,
                variant,
              }),
              className,
            )}
            disabled={disabled}
            type={type}
            aria-label={label}
          >
            {children}
            <TouchTarget />
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  },
)

type IconLinkProp = React.ComponentPropsWithRef<typeof RemixLink> &
  Omit<VariantProps<typeof iconButtonVariants>, 'elementType'> & {
    label: string
  }

const IconLink = forwardRef<HTMLAnchorElement, IconLinkProp>(function IconLink(
  { label, size, variant, className, children, ...props },
  ref,
) {
  return (
    <TooltipProvider delayDuration={350}>
      <Tooltip>
        <TooltipTrigger asChild>
          <RemixLink
            {...props}
            className={cn(
              iconButtonVariants({
                elementType: 'link',
                size,
                variant,
              }),
              className,
            )}
            aria-label={label}
            ref={ref}
          >
            {children}
            <TouchTarget />
          </RemixLink>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

type IconAnchorProp = React.ComponentPropsWithRef<'a'> &
  Omit<VariantProps<typeof iconButtonVariants>, 'elementType'> & {
    label: string
  }

const IconAnchor = forwardRef<HTMLAnchorElement, IconAnchorProp>(
  function IconLink(
    { label, size, variant, className, children, ...props },
    ref,
  ) {
    return (
      <TooltipProvider delayDuration={350}>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              {...props}
              className={cn(
                iconButtonVariants({
                  elementType: 'link',
                  size,
                  variant,
                }),
                className,
              )}
              aria-label={label}
              ref={ref}
            >
              {children}
              <TouchTarget />
            </a>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  },
)

function TouchTarget() {
  return (
    <div className='absolute inset-1/2 size-12 -translate-x-1/2 -translate-y-1/2' />
  )
}

export { IconButton, IconLink, IconAnchor }
