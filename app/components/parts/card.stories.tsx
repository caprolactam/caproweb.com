import { type Meta, type StoryObj } from '@storybook/react'
import { userEvent, within, expect } from '@storybook/test'
import { createRoutesStub } from 'react-router'
import {
  CardRoot,
  CardTitleWithLink,
  CardDescription,
  type CardTitleWithLinkProps,
  type CardDescriptionProps,
} from './card.tsx'

function Card({
  description,
  ...props
}: CardTitleWithLinkProps & CardDescriptionProps) {
  return (
    <CardRoot>
      <CardTitleWithLink {...props} />
      <CardDescription description={description} />
    </CardRoot>
  )
}

const meta = {
  title: 'App/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    to: {
      control: false,
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    title: 'カード',
    description: 'カードはタイトルと説明を表示し移動を可能にします。',
    to: '/test',
  },
  render: function Render(props) {
    const RemixStub = createRoutesStub([
      {
        path: '/',
        Component: () => Card(props),
      },
      {
        path: '/test',
        Component: () => <div style={{ color: 'green' }}>Succeeded !</div>,
      },
    ])

    return <RemixStub />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByText('カード'))

    await expect(canvas.getByText('Succeeded !')).toBeInTheDocument()
  },
}

export const Grid: Story = {
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'カード',
    description: 'カードはタイトルと説明を表示し移動を可能にします。',
    to: '/',
  },
  render: function Render(props) {
    const RemixStub = createRoutesStub([
      {
        path: '/',
        Component: () => {
          return (
            <ul className='grid grid-cols-2 gap-x-2 md:gap-x-3'>
              {Array.from({ length: 5 }, (_, i) => i).map((v) => (
                <li key={v}>
                  <Card
                    title={props.title}
                    description={props.description}
                    to={props.to}
                  />
                </li>
              ))}
            </ul>
          )
        },
      },
    ])

    return <RemixStub />
  },
}
