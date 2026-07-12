import type { DocsSiteSeoDefaults } from '~/types/docs-site'

export function createDocsCanonicalUrl(
  path: string,
  seo: DocsSiteSeoDefaults,
  fallbackOrigin: string,
) {
  const base = seo.siteUrl ?? fallbackOrigin

  return new URL(path || '/', base).toString()
}

export function createDocsSeoTitle(title: string, seo: DocsSiteSeoDefaults) {
  const template = seo.titleTemplate

  if (template?.includes('%s')) {
    return template.replace('%s', title)
  }

  return title === seo.siteTitle ? seo.siteTitle : `${title} | ${seo.siteTitle}`
}
