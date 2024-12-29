import { cva } from 'class-variance-authority'
import { clsx } from 'clsx'

const DEFAULT_DURATION = 200
const DEFAULT_EASE = [0.215, 0.61, 0.355, 1]

type Indicator = 'underline' | 'background'
type ExtendedIndicator = Indicator | 'inverse-background'

const triggerStyles = clsx(
  'group flex h-12 shrink-0 grow select-none items-center justify-center px-2 md:px-4',
  'transition-colors duration-150 ease-linear hover:bg-green-4 focus-visible:bg-green-5 active:bg-green-5',
)

const indicatorContainerStyles = cva(
  'relative flex items-center whitespace-nowrap text-sm font-medium',
  {
    variants: {
      indicator: {
        underline: 'h-full',
        background: 'px-2 py-1',
        'inverse-background': 'px-2 py-1',
      } satisfies Record<ExtendedIndicator, string>,
    },
  },
)

const indicatorStyles = cva(
  'absolute z-[1] origin-left opacity-0 group-data-[state="active"]:opacity-100',
  {
    variants: {
      indicator: {
        underline:
          'inset-x-0 bottom-0 h-[3px] w-full rounded-t-[3px] group-data-[state="active"]:bg-green-9',
        background:
          'inset-0 rounded-[3px] group-data-[state="active"]:bg-green-6',
        'inverse-background':
          'inset-0 rounded-[3px] group-data-[state="active"]:bg-green-9',
      } satisfies Record<ExtendedIndicator, string>,
    },
    defaultVariants: {
      indicator: 'underline',
    },
  },
)

const triggerLabelStyles = cva('z-[2] text-green-12', {
  variants: {
    indicator: {
      underline: 'group-data-[state="active"]:text-green-9',
      background: undefined,
      'inverse-background': undefined,
    } satisfies Record<ExtendedIndicator, string | undefined>,
  },
  defaultVariants: {
    indicator: 'underline',
  },
})

export {
  DEFAULT_DURATION,
  DEFAULT_EASE,
  triggerStyles,
  indicatorContainerStyles,
  indicatorStyles,
  triggerLabelStyles,
}

export type { Indicator, ExtendedIndicator }
