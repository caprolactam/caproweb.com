import { unified } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import postcssGlobalData from '@csstools/postcss-global-data'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, svgoOptimizer } from 'astro/config'
import autoPrefixer from 'autoprefixer'
import customMediaQuery from 'postcss-custom-media'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkHeadingId from 'remark-custom-header-id'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'
import { rehypeCodeHighlight } from './scripts/custom-syntax-highlighter.ts'

export default defineConfig({
  site: 'https://caproweb.com',
  output: 'static',
  prefetch: {
    defaultStrategy: 'viewport',
    prefetchAll: true,
  },
  srcDir: './app',
  experimental: {
    clientPrerender: true,
    contentIntellisense: true,
    svgOptimizer: svgoOptimizer(),
  },
  markdown: {
    processor: unified({
      smartypants: false,
      remarkPlugins: [remarkHeadingId],
      remarkRehype: {
        footnoteLabel: '脚注',
        footnoteLabelProperties: { className: undefined },
        footnoteBackLabel: (
          referenceIndex: number,
          _rereferenceIndex: number,
        ) => `参照${referenceIndex + 1}に戻る`,
      },
      rehypePlugins: [
        rehypeCodeHighlight,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            headingProperties: {
              'data-link-heading': '',
            },
            properties: {
              title: 'このセクションのURL',
              tabIndex: -1,
              ariaHidden: 'true',
            },
          },
        ],
      ],
    }),
    // do it manually
    syntaxHighlight: false,
  },
  integrations: [react(), mdx()],
  vite: {
    css: {
      transformer: 'postcss',
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName: import.meta.env.PROD
          ? '[hash:base64:7]'
          : '[name]__[local]__[hash:base64:5]',
      },
      postcss: {
        plugins: [
          postcssGlobalData({
            files: ['./app/styles/app.css'],
          }),
          customMediaQuery(),
          autoPrefixer(),
        ],
      },
    },
    plugins: [
      tailwindcss(),
      iconsSpritesheet({
        withTypes: true,
        inputDir: './svg-icons',
        outputDir: './public',
        typesOutputFile: './app/components/icons/types.ts',
        fileName: 'sprite.svg',
        iconNameTransformer: (name) => name,
      }),
    ],
  },
})
