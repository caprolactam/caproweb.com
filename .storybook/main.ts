import { type StorybookConfig } from '@storybook/react-vite'
// import remarkFrontmatter from 'remark-frontmatter'

const isProd = process.env.NODE_ENV === 'production'
const prodStoriesDir: Array<string> = [
  // '../showcases/**/*.mdx',
  // '../showcases/**/*.stories.@(ts|tsx)',
]
const devStoriesDir = [
  ...prodStoriesDir,
  '../app/components/**/*.mdx',
  '../app/components/**/*.stories.@(ts|tsx)',
]

const config: StorybookConfig = {
  stories: isProd ? prodStoriesDir : devStoriesDir,
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-console',
    /**
     * @see https://github.com/storybookjs/storybook/tree/next/code/addons/essentials#contents
     * includes:
     *  - Actions
     *  - Backgrounds
     *  - Controls
     *  - Docs
     *  - Viewport
     *  - Toolbars
     *  - Measure
     *  - Outline
     */
    {
      name: '@storybook/addon-essentials',
      options: {
        backgrounds: false,
        docs: false,
      },
    },
    '@storybook/addon-interactions',
    '@storybook/addon-links',
    '@storybook/addon-storysource',
    '@storybook/addon-themes',
    {
      name: '@storybook/addon-docs',
      options: {
        csfPluginOptions: null,
        mdxPluginOptions: {
          mdxCompileOptions: {
            // remarkPlugins: [remarkFrontmatter],
            // rehypePlugins: [],
          },
        },
      },
    },
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: 'vite-storybook.config.ts',
      },
    },
  },
  staticDirs: ['../public'],
}

export default config
