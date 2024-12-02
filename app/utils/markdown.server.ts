import { z } from 'zod'

export const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
})

export type Frontmatter = z.infer<typeof frontmatterSchema>

export const metadatasSchema = z
  .array(
    z.object({
      path: z.string(),
      filename: z.string(),
      data: frontmatterSchema,
    }),
  )
  .transform((metadatas) =>
    metadatas.map((metadata) => ({
      filename: metadata.filename,
      ...metadata.data,
    })),
  )
