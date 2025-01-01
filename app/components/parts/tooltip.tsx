import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import React from 'react'
import { cn } from '#app/utils/misc.ts'

function TooltipProvider({
  children,
  delayDuration = 700,
  skipDelayDuration = 0,
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      {children}
    </TooltipPrimitive.Provider>
  )
}

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

interface TooltipContentProp
  extends React.ComponentPropsWithRef<typeof TooltipPrimitive.Content> {}

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProp
>(function TooltipContent(
  { children, sideOffset = 4, side = 'top', ...props },
  ref,
) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        className={cn([
          // base
          'z-50 mx-1 inline-flex h-6 items-center rounded-sm bg-brand-12 px-2 text-xs text-brand-3',
          // animation base
          'ease-out-cubic origin-[var(--radix-tooltip-content-transform-origin)]',
          // animation enter
          'animate-in fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
          // animation exit
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        ])}
        sideOffset={sideOffset}
        side={side}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
})

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
