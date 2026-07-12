import type { DocsPageIdentity, DocsPageRecord } from '~/types/docs'
import type { DocsSiteSeoDefaults } from '~/types/docs-site'
import {
  createDocsIdentityIndex,
  resolveDocsPageIdentity,
} from '~/utils/docs-navigation'
import { createDocsCanonicalUrl } from '~/utils/docs-seo'

export type DocsGeneratedPageRecord = Pick<
  DocsPageRecord,
  'path' | 'stem' | 'docsMetadata'
>

export type DocsGeneratedPageEntry = {
  identity: DocsPageIdentity
  title: string
  description?: string
  url: string
}

export function createDocsGeneratedPageEntries(
  records: readonly DocsGeneratedPageRecord[],
  seo: DocsSiteSeoDefaults,
  fallbackOrigin: string,
): DocsGeneratedPageEntry[] {
  createDocsIdentityIndex([...records])

  return records
    .filter((record) => record.docsMetadata.hidden !== true)
    .map((record) => {
      const identity = resolveDocsPageIdentity(record)

      return {
        identity,
        title: record.docsMetadata.title,
        description: record.docsMetadata.description,
        url: createDocsCanonicalUrl(identity.routePath, seo, fallbackOrigin),
      }
    })
    .toSorted((left, right) => left.url.localeCompare(right.url))
}
