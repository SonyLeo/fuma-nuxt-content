import type { DocsSiteConfig } from '~/types/docs-site'

export function createDocsCanonicalUrl(
  path: string,
  site: Pick<DocsSiteConfig, 'seo'>,
  fallbackOrigin: string,
) {
  const base = site.seo?.siteUrl ?? fallbackOrigin

  return new URL(path || '/', base).toString()
}

export function createDocsSeoTitle(title: string, site: DocsSiteConfig) {
  const template = site.seo?.titleTemplate

  if (template?.includes('%s')) {
    return template.replace('%s', title)
  }

  return title === site.title ? site.title : `${title} | ${site.title}`
}
