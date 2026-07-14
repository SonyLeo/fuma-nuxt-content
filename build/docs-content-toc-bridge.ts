import type { FileAfterParseHook } from '@nuxt/content'
import {
  docsCanonicalTocKey,
  type DocsCanonicalTocRecord,
} from '../app/utils/docs-markdown-semantics'

type MutableRecord = Record<string, unknown>

type DocsTocLink = {
  id: string
  text: string
  depth: number
  children?: DocsTocLink[]
} & MutableRecord

const canonicalRecordKeys = new Set(['id', 'text', 'depth', 'owner', 'step'])

function isRecord(value: unknown): value is MutableRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getSourceIdentity(context: Pick<FileAfterParseHook, 'file'>) {
  return context.file.id || context.file.path || 'unknown'
}

function createTocBridgeError(context: FileAfterParseHook, message: string) {
  return new Error(
    `Invalid canonical TOC bridge input in collection "${context.collection.name}", source "${getSourceIdentity(context)}": ${message}`,
  )
}

function deleteCanonicalTocRecords(content: MutableRecord) {
  Reflect.deleteProperty(content, docsCanonicalTocKey)

  if (isRecord(content.meta)) {
    Reflect.deleteProperty(content.meta, docsCanonicalTocKey)
  }
}

function readCanonicalTocRecords(content: MutableRecord) {
  if (Object.hasOwn(content, docsCanonicalTocKey)) {
    return content[docsCanonicalTocKey]
  }

  return isRecord(content.meta) ? content.meta[docsCanonicalTocKey] : undefined
}

function validateCanonicalTocRecord(
  value: unknown,
  index: number,
  context: FileAfterParseHook,
): DocsCanonicalTocRecord {
  if (!isRecord(value)) {
    throw createTocBridgeError(
      context,
      `canonical record ${index} must be an object`,
    )
  }

  const unexpectedKeys = Object.keys(value).filter(
    (key) => !canonicalRecordKeys.has(key),
  )

  if (unexpectedKeys.length > 0) {
    throw createTocBridgeError(
      context,
      `canonical record ${index} contains unsupported field "${unexpectedKeys[0]}"`,
    )
  }

  if (typeof value.id !== 'string') {
    throw createTocBridgeError(
      context,
      `canonical record ${index} must have a string id`,
    )
  }

  if (typeof value.text !== 'string') {
    throw createTocBridgeError(
      context,
      `canonical record ${index} must have a string text`,
    )
  }

  const depth = value.depth

  if (
    typeof depth !== 'number' ||
    !Number.isInteger(depth) ||
    depth < 1 ||
    depth > 6
  ) {
    throw createTocBridgeError(
      context,
      `canonical record ${index} must have depth 1..6`,
    )
  }

  if (typeof value.owner !== 'undefined' && value.owner !== 'steps') {
    throw createTocBridgeError(
      context,
      `canonical record ${index} has unsupported owner "${String(value.owner)}"`,
    )
  }

  if (
    typeof value.step !== 'undefined' &&
    (typeof value.step !== 'number' || !Number.isFinite(value.step))
  ) {
    throw createTocBridgeError(
      context,
      `canonical record ${index} step must be a finite number`,
    )
  }

  return value as DocsCanonicalTocRecord
}

function validateCanonicalTocRecords(
  value: unknown,
  context: FileAfterParseHook,
) {
  if (!Array.isArray(value)) {
    throw createTocBridgeError(context, 'canonical records must be an array')
  }

  return value.map((record, index) =>
    validateCanonicalTocRecord(record, index, context),
  )
}

function flattenExistingTocLinks(
  value: unknown,
  context: FileAfterParseHook,
): DocsTocLink[] {
  if (!Array.isArray(value)) {
    throw createTocBridgeError(context, 'body.toc.links must be an array')
  }

  const result: DocsTocLink[] = []

  function visit(link: unknown) {
    if (!isRecord(link)) {
      throw createTocBridgeError(
        context,
        'body.toc.links entries must be objects',
      )
    }

    if (typeof link.id !== 'string' || !link.id) {
      throw createTocBridgeError(
        context,
        'every existing MDC TOC link must have a non-empty string id',
      )
    }

    result.push(link as DocsTocLink)

    if (typeof link.children !== 'undefined') {
      if (!Array.isArray(link.children)) {
        throw createTocBridgeError(
          context,
          `children for existing MDC TOC id "${link.id}" must be an array`,
        )
      }

      for (const child of link.children) {
        visit(child)
      }
    }
  }

  for (const link of value) {
    visit(link)
  }

  return result
}

function createMetadataByExistingId(
  existingLinks: DocsTocLink[],
  context: FileAfterParseHook,
) {
  const metadataById = new Map<string, MutableRecord>()

  for (const link of existingLinks) {
    if (metadataById.has(link.id)) {
      throw createTocBridgeError(
        context,
        `duplicate existing MDC TOC id "${link.id}"`,
      )
    }

    const { children: _children, ...metadata } = link
    metadataById.set(link.id, metadata)
  }

  return metadataById
}

function createRecordsById(records: readonly DocsCanonicalTocRecord[]) {
  const recordsById = new Map<string, DocsCanonicalTocRecord[]>()

  for (const record of records) {
    const matches = recordsById.get(record.id) ?? []
    matches.push(record)
    recordsById.set(record.id, matches)
  }

  return recordsById
}

function assertExistingLinksMapToCanonicalRecords(
  existingLinks: readonly DocsTocLink[],
  recordsById: ReadonlyMap<string, readonly DocsCanonicalTocRecord[]>,
  context: FileAfterParseHook,
) {
  for (const link of existingLinks) {
    const matches = recordsById.get(link.id) ?? []

    if (matches.length !== 1) {
      throw createTocBridgeError(
        context,
        `existing MDC TOC id "${link.id}" maps to ${matches.length} canonical records`,
      )
    }
  }
}

function getTocDepthFilter(tocDepth: unknown) {
  if (typeof tocDepth !== 'number') {
    return { min: 2, max: 6 }
  }

  const normalizedDepth = tocDepth < 1 || tocDepth > 5 ? 1 : tocDepth

  return {
    min: 2,
    max: Math.trunc(normalizedDepth) + 1,
  }
}

function isStepRecordAllowedByTocDepth(
  record: DocsCanonicalTocRecord,
  tocDepth: unknown,
) {
  const filter = getTocDepthFilter(tocDepth)

  return record.depth >= filter.min && record.depth <= filter.max
}

function assertNoIncludedDuplicateIds(
  records: readonly DocsCanonicalTocRecord[],
  context: FileAfterParseHook,
) {
  const seen = new Set<string>()

  for (const record of records) {
    if (seen.has(record.id)) {
      throw createTocBridgeError(
        context,
        `included canonical TOC id "${record.id}" is duplicated`,
      )
    }

    seen.add(record.id)
  }
}

function createFlatProjectedLinks(
  records: readonly DocsCanonicalTocRecord[],
  metadataById: ReadonlyMap<string, MutableRecord>,
) {
  return records.map((record): DocsTocLink => {
    const metadata = metadataById.get(record.id) ?? {}

    return {
      ...metadata,
      id: record.id,
      depth: record.depth,
      text: record.text,
    }
  })
}

function nestTocLinks(links: DocsTocLink[]) {
  if (links.length <= 1) {
    return links
  }

  const toc: DocsTocLink[] = []
  let parent: DocsTocLink | undefined

  for (const link of links) {
    Reflect.deleteProperty(link, 'children')

    if (!parent || link.depth <= parent.depth) {
      link.children = []
      parent = link
      toc.push(link)
    } else {
      parent.children ??= []
      parent.children.push(link)
    }
  }

  for (const link of toc) {
    if (link.children?.length) {
      link.children = nestTocLinks(link.children)
    } else {
      Reflect.deleteProperty(link, 'children')
    }
  }

  return toc
}

export function buildDocsContentToc(
  existingToc: MutableRecord,
  canonicalRecords: readonly DocsCanonicalTocRecord[],
  context: FileAfterParseHook,
) {
  const existingLinks = flattenExistingTocLinks(existingToc.links, context)
  const metadataById = createMetadataByExistingId(existingLinks, context)
  const existingSelectedIds = new Set(metadataById.keys())
  const recordsById = createRecordsById(canonicalRecords)

  assertExistingLinksMapToCanonicalRecords(existingLinks, recordsById, context)

  const includedRecords = canonicalRecords.filter((record) => {
    return (
      existingSelectedIds.has(record.id) ||
      (record.owner === 'steps' &&
        isStepRecordAllowedByTocDepth(record, existingToc.depth))
    )
  })

  assertNoIncludedDuplicateIds(includedRecords, context)

  return {
    ...existingToc,
    links: nestTocLinks(
      createFlatProjectedLinks(includedRecords, metadataById),
    ),
  }
}

export function normalizeDocsContentToc(context: FileAfterParseHook) {
  const content = context.content
  const canonicalValue = readCanonicalTocRecords(content)

  try {
    const body = isRecord(content.body) ? content.body : undefined
    const existingToc = isRecord(body?.toc) ? body.toc : undefined

    if (!existingToc) {
      return
    }

    if (typeof canonicalValue === 'undefined') {
      const existingLinks = Array.isArray(existingToc.links)
        ? existingToc.links
        : []

      if (existingLinks.length > 0) {
        throw createTocBridgeError(
          context,
          'body.toc exists but canonical records are missing',
        )
      }

      return
    }

    if (!body) {
      return
    }

    body.toc = buildDocsContentToc(
      existingToc,
      validateCanonicalTocRecords(canonicalValue, context),
      context,
    )
  } finally {
    deleteCanonicalTocRecords(content)
  }
}
