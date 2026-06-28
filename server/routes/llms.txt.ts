import { queryCollection } from '@nuxt/content/server'
import { docsSiteConfig } from '~/config/docs-site'
import {
  resolveDocsRecordSourcePath,
  resolveDocsRoutePath,
} from '~/utils/docs-navigation'
import { createDocsCanonicalUrl } from '~/utils/docs-seo'

type LlmsPage = {
  id?: string
  path?: string
  stem?: string
  slug?: string
  title?: string
  description?: string
  hidden?: boolean
}

function createPageRecord(page: LlmsPage) {
  return {
    path: page.path ?? page.stem ?? page.id ?? '/',
    stem: page.stem,
    slug: page.slug,
  }
}

export default defineEventHandler(async (event) => {
  const requestUrl = getRequestURL(event)
  const pages = (await queryCollection(event, 'docs')
    .select('id', 'stem', 'slug', 'title', 'description', 'hidden')
    .all()) as unknown as LlmsPage[]
  const entries = pages
    .filter((page) => !page.hidden && (page.path || page.stem || page.id))
    .map((page) => {
      const record = createPageRecord(page)
      const sourcePath = resolveDocsRecordSourcePath(record)
      const routePath = resolveDocsRoutePath(sourcePath, record)
      const url = createDocsCanonicalUrl(
        routePath,
        docsSiteConfig,
        requestUrl.origin,
      )

      return {
        title: page.title ?? sourcePath,
        description: page.description,
        url,
      }
    })
    .toSorted((left, right) => left.url.localeCompare(right.url))

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return [
    `# ${docsSiteConfig.title}`,
    '',
    docsSiteConfig.description ?? '',
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
