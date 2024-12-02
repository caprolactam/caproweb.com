import { useArgs } from '@storybook/preview-api'
import { type Meta, type StoryObj } from '@storybook/react'
import { FilterChip } from './filter-chip.tsx'

const meta = {
  title: 'App/FilterChip',
  component: FilterChip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    selected: {
      control: 'boolean',
    },
    value: {
      control: false,
    },
    className: {
      control: false,
    },
    onSelect: {
      control: false,
    },
  },
  args: {
    selected: true,
    children: 'Remix',
    value: 'remix',
    disabled: false,
  },
  render: function Render(props) {
    const [{ selected }, updateArgs] = useArgs<typeof props>()

    function onSelect(s: boolean | 'indeterminate') {
      if (s === 'indeterminate') {
        updateArgs({ selected: false })
        return
      }
      updateArgs({ selected: !selected })
    }

    return (
      <FilterChip
        {...props}
        selected={selected}
        onSelect={onSelect}
      />
    )
  },
} satisfies Meta<typeof FilterChip>

export default meta
type Story = StoryObj<typeof meta>

export const Selected: Story = {
  args: {
    selected: true,
  },
}

export const Unselected: Story = {
  args: {
    selected: false,
  },
}

export const Disabled: Story = {
  args: {
    selected: true,
    disabled: true,
  },
}
