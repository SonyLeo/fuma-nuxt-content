import { queryCollection } from '@nuxt/content/server'
import { docsSiteConfig } from '~/config/docs-site'
import {
  resolveDocsRecordSourcePath,
  resolveDocsRoutePath,
} from '~/utils/docs-navigation'
import { createDocsCanonicalUrl } from '~/utils/docs-seo'

type SitemapPage = {
  id?: string
  path?: string
  stem?: string
  slug?: string
  hidden?: boolean
}

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
    .select('id', 'stem', 'slug', 'hidden')
    .all()) as unknown as SitemapPage[]
  const urls = pages
    .filter((page) => !page.hidden && (page.path || page.stem || page.id))
    .map((page) => {
      const record = {
        path: page.path ?? page.stem ?? page.id ?? '/',
        stem: page.stem,
        slug: page.slug,
      }
      const sourcePath = resolveDocsRecordSourcePath(record)
      const routePath = resolveDocsRoutePath(sourcePath, record)

      return createDocsCanonicalUrl(
        routePath,
        docsSiteConfig,
        requestUrl.origin,
      )
    })
    .toSorted()

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
  ].join('\n')
})
