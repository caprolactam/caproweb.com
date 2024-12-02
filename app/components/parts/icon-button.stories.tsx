import { action } from '@storybook/addon-actions'
import { type Meta, type StoryObj } from '@storybook/react'
import { IconButton } from './icon-button.tsx'
import { Icon } from './icon.tsx'

const meta = {
  title: 'App/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: false,
    },
    label: {
      control: false,
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'ボタンのサイズ',
    },
    disabled: {
      type: 'boolean',
    },
    variant: {
      control: 'select',
      options: ['filled', 'ghost'],
      description: 'ボタンの状態',
    },
  },
  args: {
    size: 'md',
    variant: 'filled',
    disabled: false,
    label: 'マイク',
  },
  render: ({ variant, onClick: _, ...args }) => (
    <IconButton
      {...args}
      variant={variant}
      onClick={action('on-click')}
    >
      <Icon
        name='mic'
        size={16}
      />
    </IconButton>
  ),
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'filled',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
