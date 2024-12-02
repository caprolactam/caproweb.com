import { type Meta, type StoryObj } from '@storybook/react'
import React from 'react'
import { IconButton } from '#app/components/parts/icon-button.tsx'
import { Icon } from '#app/components/parts/icon.tsx'
import { cn } from '../utils/misc.ts'
import { useIsMobile } from './media-query.ts'
import {
  type UnderlineOption,
  Root,
  List,
  Trigger,
  FocusNextButton,
  FocusPreviousButton,
} from './tabs.tsx'

const UnderlineOptions: Array<UnderlineOption> = ['tab', 'text']
const items = [
  'Chrome',
  'Firefox',
  'Opera',
  'Edge',
  'Safari',
  'Chromium',
  'Waterfox',
  'Brave',
  'Tor',
  'Puffin',
  'FreeNet',
  'Vivaldi',
  'Epic',
] as const
type Item = (typeof items)[number]

function Tabs({
  underlineType,
  range = 6,
}: {
  underlineType: UnderlineOption
  range: number
}) {
  const [value, setValue] = React.useState<Item>('Chrome')
  const lists = items.slice(0, range)

  React.useEffect(() => {
    const valueIndex = lists.indexOf(value)
    if (valueIndex === -1 || valueIndex >= lists.length - 1) {
      setValue(lists[lists.length - 2]!)
    }
  }, [lists])

  const isMobile = useIsMobile()

  return (
    <div className='grid gap-6'>
      <Root
        className='relative bg-brand-1'
        value={value}
        onValueChange={(v) => {
          if (items.includes(v)) {
            setValue(v as Item)
          }
        }}
        underline={underlineType}
      >
        <List
          className='h-12 border-b border-brand-6'
          aria-label='Best browser'
        >
          {lists.map((item) => (
            <Trigger
              key={item}
              className={cn([
                'relative flex items-center justify-center text-sm text-brand-12',
                'before:absolute before:inset-0 before:bg-transparent',
                'before:hover:bg-brand-12/8 before:focus-visible:bg-brand-12/10 before:active:bg-brand-12/10',
              ])}
              value={item}
            >
              {item}
            </Trigger>
          ))}
        </List>
        {!isMobile && (
          <>
            <FocusPreviousButton asChild>
              <IconButton
                className='absolute -left-12 top-1'
                label='Previous tab'
                variant='ghost'
                type='button'
              >
                <Icon
                  name='chevron-left'
                  size={30}
                />
              </IconButton>
            </FocusPreviousButton>
            <FocusNextButton asChild>
              <IconButton
                className='absolute -right-12 top-1'
                label='Next tab'
                variant='ghost'
                type='button'
              >
                <Icon
                  name='chevron-right'
                  size={30}
                  className='translate-x-0.5'
                />
              </IconButton>
            </FocusNextButton>
          </>
        )}
      </Root>
    </div>
  )
}

const meta = {
  title: 'Example/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    underlineType: {
      control: 'radio',
      options: UnderlineOptions,
    },
    range: {
      control: {
        type: 'range',
        min: 1,
        max: items.length,
      },
    },
  },
  args: {
    underlineType: 'tab',
    range: 6,
  },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    underlineType: 'tab',
  },
}
