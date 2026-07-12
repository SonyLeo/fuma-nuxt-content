import { queryCollection } from '@nuxt/content/server'
import { docsSiteAdapter } from '~/config/docs-site'
import type { DocsGeneratedPageRecord } from '../utils/docs-generated-pages'
import { createDocsGeneratedPageEntries } from '../utils/docs-generated-pages'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler(async (event) => {
  const requestUrl = getRequestURL(event)
  const pages = (await queryCollection(event, 'docs')
    .select('path', 'stem', 'docsMetadata')
    .all()) as unknown as DocsGeneratedPageRecord[]
  const urls = createDocsGeneratedPageEntries(
    pages,
    docsSiteAdapter.page.seo,
    requestUrl.origin,
  ).map((entry) => entry.url)

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
  ].join('\n')
})
