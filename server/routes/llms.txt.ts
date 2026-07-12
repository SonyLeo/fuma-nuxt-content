import { queryCollection } from '@nuxt/content/server'
import { docsSiteAdapter } from '~/config/docs-site'
import type { DocsGeneratedPageRecord } from '../utils/docs-generated-pages'
import { createDocsGeneratedPageEntries } from '../utils/docs-generated-pages'

export default defineEventHandler(async (event) => {
  const requestUrl = getRequestURL(event)
  const pages = (await queryCollection(event, 'docs')
    .select('path', 'stem', 'docsMetadata')
    .all()) as unknown as DocsGeneratedPageRecord[]
  const entries = createDocsGeneratedPageEntries(
    pages,
    docsSiteAdapter.page.seo,
    requestUrl.origin,
  )

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return [
    `# ${docsSiteAdapter.content.title}`,
    '',
    docsSiteAdapter.content.description ?? '',
    '',
    '## Docs',
    '',
    ...entries.map((entry) => {
      const description = entry.description ? ` - ${entry.description}` : ''

      return `- [${entry.title}](${entry.url})${description}`
    }),
    '',
  ].join('\n')
})
