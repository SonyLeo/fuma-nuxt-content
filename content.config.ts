import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        sectionLabel: z.string().optional(),
        order: z.number().optional(),
        hidden: z.boolean().optional(),
        badge: z.string().optional(),
      }),
    }),
  },
})
