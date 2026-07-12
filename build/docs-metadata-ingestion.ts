import type { FileAfterParseHook, TransformedContent } from '@nuxt/content'
import { defineTransformer } from '@nuxt/content'
import {
  DocsMetadataValidationError,
  docsDirectoryMetadataFields,
  docsPageMetadataFields,
  normalizeDocsDirectoryMetadata,
  normalizeDocsPageMetadata,
} from '../shared/docs-metadata'

const docsMetadataSourceKey = '__docsMetadataSource'

type DocsMetadataCollection = 'docs' | 'docsMeta'

type DocsMetadataContext = {
  collection: DocsMetadataCollection
  source: string
}

function getSourceIdentity(context: Pick<FileAfterParseHook, 'file'>) {
  return context.file.id || context.file.path
}

function createSourceAwareValidationError(
  context: DocsMetadataContext,
  error: DocsMetadataValidationError,
) {
  return new Error(
    [
      `Invalid metadata in collection "${context.collection}", source "${context.source}":`,
      ...error.details.map((detail) => `- ${detail}`),
    ].join('\n'),
    { cause: error },
  )
}

function normalizeWithContext<T>(
  normalize: (input: unknown) => T,
  input: unknown,
  context: DocsMetadataContext,
) {
  try {
    return normalize(input)
  } catch (error) {
    if (error instanceof DocsMetadataValidationError) {
      throw createSourceAwareValidationError(context, error)
    }

    throw error
  }
}

function replaceMetadataFields(
  content: Record<string, unknown>,
  metadata: Record<string, unknown>,
  fields: readonly string[],
) {
  for (const field of fields) {
    if (Object.hasOwn(metadata, field)) {
      content[field] = metadata[field]
    } else {
      Reflect.deleteProperty(content, field)
    }
  }
}

function readMetadataSource(content: Record<string, unknown>) {
  if (!content.meta || typeof content.meta !== 'object') {
    return undefined
  }

  const meta = content.meta as Record<string, unknown>
  const source = meta[docsMetadataSourceKey]
  Reflect.deleteProperty(meta, docsMetadataSourceKey)

  return source
}

export function captureDocsMetadataProvenance(
  content: TransformedContent,
): TransformedContent {
  if (typeof content.id !== 'string' || !content.id.startsWith('docs/')) {
    return content
  }

  const source = Object.fromEntries(
    docsPageMetadataFields
      .filter((field) => Object.hasOwn(content, field))
      .map((field) => [field, content[field]]),
  )

  return {
    ...content,
    [docsMetadataSourceKey]: source,
  }
}

export const docsMetadataProvenanceTransformer = defineTransformer({
  name: 'docs-metadata-provenance',
  extensions: ['.md'],
  transform(content) {
    return captureDocsMetadataProvenance(content)
  },
})

export function normalizeDocsMetadataContent(context: FileAfterParseHook) {
  if (context.collection.name === 'docs') {
    const source = readMetadataSource(context.content)

    if (!source) {
      throw new Error(
        `Missing metadata provenance for collection "docs", source "${getSourceIdentity(context)}"`,
      )
    }

    const metadata = normalizeWithContext(normalizeDocsPageMetadata, source, {
      collection: 'docs',
      source: getSourceIdentity(context),
    })

    replaceMetadataFields(context.content, metadata, docsPageMetadataFields)
    context.content.docsMetadata = metadata
    return
  }

  if (context.collection.name !== 'docsMeta') {
    return
  }

  const metadata = normalizeWithContext(
    normalizeDocsDirectoryMetadata,
    {
      ...context.content,
      stem: context.content.stem,
    },
    {
      collection: 'docsMeta',
      source: getSourceIdentity(context),
    },
  )

  replaceMetadataFields(context.content, metadata, docsDirectoryMetadataFields)
  context.content.docsMetadata = metadata
}

export default docsMetadataProvenanceTransformer
