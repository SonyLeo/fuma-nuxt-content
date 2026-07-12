import { z } from '@nuxt/content'

const nonEmptyTitleSchema = z.string().trim().min(1, {
  message: 'Expected an explicit non-empty title',
})

const docsMetaLeafEntrySchema = z.union([
  z.string(),
  z.object({
    type: z.literal('separator'),
    title: nonEmptyTitleSchema,
    icon: z.string().optional(),
  }),
  z.object({
    type: z.literal('link'),
    title: nonEmptyTitleSchema,
    href: z.string(),
    external: z.boolean().optional(),
    badge: z.string().optional(),
    icon: z.string().optional(),
  }),
  z.object({
    type: z.literal('page'),
    name: z.string(),
    title: nonEmptyTitleSchema.optional(),
    badge: z.string().optional(),
    icon: z.string().optional(),
    status: z.string().optional(),
    hidden: z.boolean().optional(),
    defaultOpen: z.boolean().optional(),
    collapsible: z.boolean().optional(),
  }),
])

const docsMetaPageEntrySchema = z.union([
  docsMetaLeafEntrySchema,
  z.object({
    type: z.literal('group'),
    name: z.string(),
    title: nonEmptyTitleSchema.optional(),
    badge: z.string().optional(),
    icon: z.string().optional(),
    status: z.string().optional(),
    hidden: z.boolean().optional(),
    defaultOpen: z.boolean().optional(),
    collapsible: z.boolean().optional(),
    pages: z.array(docsMetaLeafEntrySchema).optional(),
    pagesIndex: z.string().optional(),
  }),
])

export const docsPageMetadataSchema = z.object({
  title: nonEmptyTitleSchema,
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
})

export const docsDirectoryMetadataSourceSchema = z.object({
  title: nonEmptyTitleSchema.optional(),
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
})

export const docsDirectoryMetadataSchema =
  docsDirectoryMetadataSourceSchema.extend({
    stem: z.string(),
  })

export const docsPageCollectionMetadataSchema = docsPageMetadataSchema.extend({
  docsMetadata: docsPageMetadataSchema,
})

export const docsDirectoryCollectionMetadataSchema =
  docsDirectoryMetadataSourceSchema.extend({
    docsMetadata: docsDirectoryMetadataSchema,
  })

export type DocsMetaPageEntry = ReturnType<typeof docsMetaPageEntrySchema.parse>
export type DocsPageMetadata = ReturnType<typeof docsPageMetadataSchema.parse>
export type DocsDirectoryMetadata = ReturnType<
  typeof docsDirectoryMetadataSchema.parse
>

type DocsMetadataIssue = {
  path: PropertyKey[]
  message: string
}

type DocsMetadataSchema<T> = {
  safeParse(input: unknown):
    | {
        success: true
        data: T
      }
    | {
        success: false
        error: {
          issues: DocsMetadataIssue[]
        }
      }
}

function describeValueType(value: unknown) {
  if (value === null) {
    return 'null'
  }

  if (Array.isArray(value)) {
    return 'array'
  }

  return typeof value
}

function formatValue(value: unknown) {
  if (value === undefined) {
    return 'undefined'
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function readPathValue(value: unknown, path: PropertyKey[]) {
  let current = value

  for (const segment of path) {
    if (!current || typeof current !== 'object') {
      return undefined
    }

    current = (current as Record<PropertyKey, unknown>)[segment]
  }

  return current
}

function formatFieldPath(path: PropertyKey[]) {
  return path.length > 0 ? path.map(String).join('.') : '$metadata'
}

export class DocsMetadataValidationError extends Error {
  readonly details: string[]

  constructor(input: unknown, issues: DocsMetadataIssue[]) {
    const details = issues.map((issue) => {
      const value = readPathValue(input, issue.path)

      return [
        `field "${formatFieldPath(issue.path)}"`,
        `value ${formatValue(value)} (${describeValueType(value)})`,
        `rule: ${issue.message}`,
      ].join(', ')
    })

    super(
      ['Invalid metadata:', ...details.map((detail) => `- ${detail}`)].join(
        '\n',
      ),
    )
    this.name = 'DocsMetadataValidationError'
    this.details = details
  }
}

function parseWithSchema<T>(schema: DocsMetadataSchema<T>, input: unknown) {
  const result = schema.safeParse(input)

  if (!result.success) {
    throw new DocsMetadataValidationError(input, result.error.issues)
  }

  return result.data
}

function normalizeDirectoryStem(value: string) {
  return value
    .replace(/\\/g, '/')
    .replace(/\/meta$/, '')
    .replace(/\/index$/, '')
}

export const docsPageMetadataFields = Object.keys(docsPageMetadataSchema.shape)
export const docsDirectoryMetadataFields = Object.keys(
  docsDirectoryMetadataSourceSchema.shape,
)

export function normalizeDocsPageMetadata(input: unknown) {
  return parseWithSchema(docsPageMetadataSchema, input)
}

export function normalizeDocsDirectoryMetadata(input: unknown) {
  const result = parseWithSchema(docsDirectoryMetadataSchema, input)

  return {
    ...result,
    stem: normalizeDirectoryStem(result.stem),
  } satisfies DocsDirectoryMetadata
}
