import { defineCollection, defineContentConfig } from '@nuxt/content'
import {
  docsDirectoryCollectionMetadataSchema,
  docsPageCollectionMetadataSchema,
} from '../../../shared/docs-metadata'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: 'docs/**/*.md',
      schema: docsPageCollectionMetadataSchema,
    }),
    nativeDocs: defineCollection({
      type: 'page',
      source: 'native/**/*.md',
      schema: docsPageCollectionMetadataSchema.omit({ docsMetadata: true }),
    }),
    docsMeta: defineCollection({
      type: 'data',
      source: '**/meta.json',
      schema: docsDirectoryCollectionMetadataSchema,
    }),
  },
})
