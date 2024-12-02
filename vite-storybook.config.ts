import { defineConfig } from 'vite'

export default defineConfig(({}) => {
  return {
    plugins: [],
    // we don't share public assets between the storybook site and the app
    // TODO: need review to use public assets
    // publicDir: false,
  }
})
