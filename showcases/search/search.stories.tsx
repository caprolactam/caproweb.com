import { type Meta, type StoryObj } from '@storybook/react'
import { SearchDialog as Search } from './search.tsx'

const meta = {
  title: 'Example/Search',
  component: Search,
  parameters: {
    layout: 'centered',
  },
  // argTypes: {
  // },
  // args: {
  // },
} satisfies Meta<typeof Search>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
