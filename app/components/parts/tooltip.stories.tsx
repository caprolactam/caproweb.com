import { type Meta, type StoryObj } from '@storybook/react'
import React from 'react'
import { cn } from '#app/utils/misc.ts'
import { TooltipProvider, Tooltip } from './tooltip.tsx'

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function Button(props, ref) {
  return (
    <button
      type='button'
      className={cn(
        'inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-brand-3 px-4 py-2 text-sm text-brand-12',
      )}
      {...props}
      ref={ref}
    >
      アクション
    </button>
  )
})

const meta = {
  title: 'App/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
    },
    open: {
      control: 'boolean',
    },
  },
  args: {
    children: <Button />,
  },
  render: function Render(props) {
    return (
      <TooltipProvider delayDuration={350}>
        <Tooltip {...props} />
      </TooltipProvider>
    )
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'アクションの説明',
    open: true,
  },
}

export const EnterAndExit: Story = {
  args: {
    label: 'アクションの説明',
  },
}
