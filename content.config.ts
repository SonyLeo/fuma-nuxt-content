import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const docsMetaPageEntrySchema = z.union([
  z.string(),
  z.object({
    type: z.literal('separator'),
    title: z.string(),
    icon: z.string().optional(),
  }),
  z.object({
    type: z.literal('link'),
    title: z.string(),
    href: z.string(),
    external: z.boolean().optional(),
    badge: z.string().optional(),
    icon: z.string().optional(),
  }),
  z.object({
    type: z.literal('page'),
    name: z.string(),
    title: z.string().optional(),
    badge: z.string().optional(),
    icon: z.string().optional(),
    status: z.string().optional(),
    hidden: z.boolean().optional(),
    defaultOpen: z.boolean().optional(),
    collapsible: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('group'),
    name: z.string(),
    title: z.string().optional(),
    badge: z.string().optional(),
    icon: z.string().optional(),
    status: z.string().optional(),
    hidden: z.boolean().optional(),
    defaultOpen: z.boolean().optional(),
    collapsible: z.boolean().optional(),
  }),
])

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        sectionLabel: z.string().optional(),
        slug: z.string().optional(),
        order: z.number().optional(),
        hidden: z.boolean().optional(),
        badge: z.string().optional(),
        icon: z.string().optional(),
        status: z.string().optional(),
        defaultOpen: z.boolean().optional(),
        collapsible: z.boolean().optional(),
        full: z.boolean().optional(),
        toc: z.boolean().optional(),
        tocPopover: z.boolean().optional(),
        pager: z.boolean().optional(),
        breadcrumb: z.boolean().optional(),
        breadcrumbRoot: z
          .union([
            z.boolean(),
            z.object({
              path: z.string().optional(),
              title: z.string().optional(),
            }),
          ])
          .optional(),
        breadcrumbPage: z.boolean().optional(),
        breadcrumbSeparator: z.boolean().optional(),
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
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        order: z.number().optional(),
        pages: z.array(docsMetaPageEntrySchema).optional(),
        pagesIndex: z.string().optional(),
        root: z.boolean().optional(),
        hidden: z.boolean().optional(),
        defaultOpen: z.boolean().optional(),
        collapsible: z.boolean().optional(),
        badge: z.string().optional(),
        icon: z.string().optional(),
      }),
    }),
  },
})
