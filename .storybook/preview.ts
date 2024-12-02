import { withThemeByClassName } from '@storybook/addon-themes'
import { type Preview, type ReactRenderer as Renderer } from '@storybook/react'
import '../app/styles/tailwind.css'
import './storybook.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeByClassName<Renderer>({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
}

export default preview
