import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

const postCollection = defineCollection({
  loader: glob({ base: './app/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    tags: z.array(z.string()).optional().default([]),
    image: z.string().optional(),
    isDraft: z.boolean(),
  }),
})

export const collections = {
  posts: postCollection,
}
