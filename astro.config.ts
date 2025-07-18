import cloudflare from '@astrojs/cloudflare'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkHeadingId from 'remark-custom-header-id'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'
import { z } from 'zod'
import { rehypeCodeHighlight } from './scripts/custom-syntax-highlighter.ts'
import { frontmatterExport } from './scripts/get-frontmatter.ts'

export default defineConfig({
  site: 'https://caproweb.com',
  output: 'static',
  adapter: cloudflare({
    platformProxy: {
      configPath: './wrangler.jsonc',
    },
  }),
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: false,
  },
  srcDir: './app',
  experimental: {
    clientPrerender: true,
    contentIntellisense: true,
    preserveScriptOrder: true,
    headingIdCompat: true,
  },
  markdown: {
    // do it manually
    syntaxHighlight: false,
    remarkPlugins: [remarkHeadingId],
    remarkRehype: {
      footnoteLabel: '脚注',
      footnoteLabelProperties: { className: undefined },
      footnoteBackLabel: (referenceIndex, _rereferenceIndex) =>
        `参照${referenceIndex + 1}に戻る`,
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
  },
  integrations: [react(), mdx(), sitemap()],
  vite: {
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD
        ? {
            'react-dom/server': 'react-dom/server.edge',
          }
        : undefined,
    },
    ssr: {
      external: ['node:path'],
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
      frontmatterExport({
        inputDir: './app/content/posts',
        output: {
          dir: './app/content',
          fileName: 'frontmatters.ts',
        },
        checkValue: z.object({
          title: z.string(),
          description: z.string().optional(),
          publishedAt: z.coerce.date(),
          updatedAt: z.coerce.date().optional(),
          tags: z.array(z.string()).optional(),
          image: z.string().optional(),
          isDraft: z.boolean(),
        }),
        transform: ({ frontmatter, filePath }) => ({
          ...frontmatter,
          filePath,
        }),
      }),
    ],
  },
})
