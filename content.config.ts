import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import {
  docsDirectoryCollectionMetadataSchema,
  docsPageCollectionMetadataSchema,
} from './shared/docs-metadata'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: docsPageCollectionMetadataSchema.extend({
        structuredData: z
          .object({
            headings: z.array(
              z.object({
                id: z.string(),
                content: z.string(),
              }),
            ),
            contents: z.array(
              z.object({
                heading: z.string().optional(),
                content: z.string(),
              }),
            ),
          })
          .optional(),
      }),
    }),
    docsMeta: defineCollection({
      type: 'data',
      source: '**/meta.json',
      schema: docsDirectoryCollectionMetadataSchema,
    }),
  },
})
