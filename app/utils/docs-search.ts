import type {
  DocsContentPage,
  DocsPageMeta,
  DocsStructuredData,
  DocsTocTreeItem,
} from '~/types/docs'
import type {
  DocsSearchIndexEntry,
  DocsSearchResult,
} from '~/types/docs-search'
import type { DocsPageTreeRuntime } from '~/utils/docs-page-tree-runtime'
import { resolveDocsRecordSourcePath } from '~/utils/docs-navigation'

type ContentAstNode = {
  type?: string
  tag?: string
  value?: string
  props?: {
    id?: string
  }
  children?: ContentAstNode[]
}

export type DocsSearchPageInput = {
  path?: string
  stem?: string
  docsMetadata: DocsPageMeta
  structuredData?: DocsStructuredData
  body?: DocsContentPage['body']
}

type DocsSearchPageRecord = DocsSearchPageInput & {
  path: string
}

function normalizeSearchText(value: string | null | undefined) {
  return (value ?? '').toLocaleLowerCase()
}

function collectTextFromBody(node: unknown): string[] {
  if (!node || typeof node !== 'object') {
    return []
  }

  const current = node as ContentAstNode
  const values = typeof current.value === 'string' ? [current.value] : []
  const children = current.children?.flatMap(collectTextFromBody) ?? []

  return [...values, ...children]
}

function collectHeadingsFromToc(items?: DocsTocTreeItem[]): string[] {
  if (!Array.isArray(items)) {
    return []
  }

  return items.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return []
    }

    const current = item as { text?: string; children?: DocsTocTreeItem[] }
    const text = typeof current.text === 'string' ? [current.text] : []

    return [...text, ...collectHeadingsFromToc(current.children)]
  })
}

function createExcerpt(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 180)
}

export function createDocsSearchIndex(
  pages: DocsSearchPageInput[] | null | undefined,
  runtime: DocsPageTreeRuntime,
): DocsSearchIndexEntry[] {
  return (pages ?? [])
    .filter((page): page is DocsSearchPageRecord => Boolean(page.path))
    .flatMap((page) => {
      const sourcePath = resolveDocsRecordSourcePath(page)
      const node = runtime.getNodeBySourcePath(sourcePath)
      const policy = runtime.getPagePolicy(sourcePath)

      if (!node?.path || !policy?.searchable) {
        return []
      }

      const headings =
        page.structuredData?.headings.map((heading) => heading.content) ??
        collectHeadingsFromToc(page.body?.toc?.links)
      const body =
        page.structuredData?.contents
          .map((content) => content.content)
          .join(' ') || collectTextFromBody(page.body).join(' ')

      return {
        id: sourcePath,
        title: page.docsMetadata.title,
        description: page.docsMetadata.description ?? node.description,
        path: node.path,
        section: page.docsMetadata.sectionLabel ?? node.sectionLabel,
        sourcePath,
        headings,
        body,
        excerpt: createExcerpt(body),
      } satisfies DocsSearchIndexEntry
    })
}

function scoreField(value: string | undefined, query: string, weight: number) {
  if (!value) {
    return 0
  }

  const normalized = normalizeSearchText(value)

  if (normalized === query) {
    return weight * 2
  }

  if (normalized.startsWith(query)) {
    return Math.round(weight * 1.5)
  }

  return normalized.includes(query) ? weight : 0
}

function scoreSearchEntry(entry: DocsSearchIndexEntry, query: string) {
  return (
    scoreField(entry.title, query, 80) +
    scoreField(entry.description, query, 50) +
    Math.max(
      ...(entry.headings ?? ['']).map((heading) =>
        scoreField(heading, query, 35),
      ),
    ) +
    scoreField(entry.excerpt, query, 20) +
    scoreField(entry.body, query, 10)
  )
}

export function searchDocsIndex(
  index: DocsSearchIndexEntry[] | null | undefined,
  query: string,
  limit = 8,
): DocsSearchResult[] {
  const normalizedQuery = normalizeSearchText(query.trim())

  if (!normalizedQuery) {
    return []
  }

  return (index ?? [])
    .map((entry) => ({
      entry,
      score: scoreSearchEntry(entry, normalizedQuery),
    }))
    .filter((item) => item.score > 0)
    .toSorted((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ entry }) => ({
      id: entry.id,
      title: entry.title,
      description: entry.description,
      path: entry.path,
      section: entry.section,
      sourcePath: entry.sourcePath,
      excerpt: entry.excerpt,
    }))
}
