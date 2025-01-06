'use client'

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import React from 'react'
import { cn } from '../utils/misc.ts'
import './styles.css'

const frameworks = ['Remix', 'Next.js', 'TanStack'] as const
type Framework = (typeof frameworks)[number]

export function RadioAnimationDemo() {
  const [value, setValue] = React.useState<Framework>(frameworks[0])

  return (
    <div className='flex justify-center'>
      <RadioGroup
        value={value}
        onValueChange={(v) => {
          if (frameworks.includes(v)) setValue(v as Framework)
        }}
        className='text-base'
        aria-label='React Framework'
      >
        {frameworks.map((framework) => {
          const radioId = `radio-${framework}`
          return (
            <label
              key={framework}
              htmlFor={radioId}
              className='flex h-10 items-center gap-4'
            >
              <RadioGroupItem
                type='button'
                value={framework}
                id={radioId}
              />
              {framework}
            </label>
          )
        })}
      </RadioGroup>
    </div>
  )
}

interface RadioGroupContextValue {
  initialRenderedRef: React.RefObject<boolean>
}

const RadioGroupContext = React.createContext<
  RadioGroupContextValue | undefined
>(undefined)

const useRadioGroupContext = () => {
  const context = React.use(RadioGroupContext)
  if (!context) {
    throw new Error(
      'useRadioGroupContext must be used within a RadioGroupProvider',
    )
  }
  return context
}

interface RadioGroupProps
  extends React.ComponentPropsWithRef<typeof RadioGroupPrimitive.Root> {}

function RadioGroup({ children, className, ...props }: RadioGroupProps) {
  const initialRenderedRef = React.useRef(true)

  React.useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      initialRenderedRef.current = false
    })

    return () => window.cancelAnimationFrame(id)
  }, [])

  return (
    <RadioGroupPrimitive.Root
      {...props}
      // RadioGroupItem use z-index: -1
      className={cn('isolate', className)}
    >
      <RadioGroupContext.Provider value={{ initialRenderedRef }}>
        {children}
      </RadioGroupContext.Provider>
    </RadioGroupPrimitive.Root>
  )
}

interface RadioGroupItemProps
  extends Omit<
    React.ComponentPropsWithRef<typeof RadioGroupPrimitive.Item>,
    'asChild' | 'children'
  > {}

function RadioGroupItem({ className, ref, ...props }: RadioGroupItemProps) {
  const { initialRenderedRef } = useRadioGroupContext()

  const tempId = React.useId()
  const maskId = `radio-mask-${props.id ?? tempId}`

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'relative size-5 cursor-default rounded-full text-brand-11 disabled:pointer-events-none disabled:text-brand-12/38 data-[state="checked"]:text-green-11 disabled:data-[state="checked"]:text-brand-12/38',
        'before:absolute before:inset-1/2 before:z-[-1] before:size-10 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:transition-colors before:ease-linear before:hover:bg-brand-4 before:focus-visible:bg-brand-5 before:active:bg-brand-5 disabled:before:hidden',
        className,
      )}
      demo-radio-item=''
      data-animated={initialRenderedRef.current ? 'false' : 'true'}
      {...props}
    >
      <svg viewBox='0 0 20 20'>
        <mask id={maskId}>
          <rect
            width='100%'
            height='100%'
            fill='white'
          />
          <circle
            cx={10}
            cy={10}
            r={8}
            fill='black'
          />
        </mask>
        <circle
          cx={10}
          cy={10}
          r={10}
          mask={`url(#${maskId})`}
          className='fill-current'
        />
        <RadioGroupPrimitive.Indicator asChild>
          <circle
            demo-radio-item-indicator=''
            cx={10}
            cy={10}
            r={5}
            className='fill-current'
          />
        </RadioGroupPrimitive.Indicator>
      </svg>
    </RadioGroupPrimitive.Item>
  )
}
