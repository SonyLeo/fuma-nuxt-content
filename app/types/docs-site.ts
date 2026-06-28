import type { DocsNavLink, DocsNavOptions } from '~/types/docs'

export type DocsSiteBrandConfig = {
  label: string
  mark?: string
}

export type DocsSiteGithubConfig = {
  owner: string
  repo: string
  branch: string
  contentDir: string
  sourceBaseUrl?: string
  editBaseUrl?: string
}

export type DocsSiteNavConfig = DocsNavOptions & {
  links?: DocsNavLink[]
}

export type DocsSitePageActionsConfig = {
  source?: boolean
  edit?: boolean
  copyMarkdown?: boolean
}

export type DocsSiteSearchProvider = 'local'

export type DocsSiteSearchConfig = {
  enabled?: boolean
  provider?: DocsSiteSearchProvider
  label?: string
  placeholder?: string
  emptyLabel?: string
}

export type DocsSiteFeedbackProvider = 'local' | 'static'

export type DocsSiteFeedbackConfig = {
  enabled?: boolean
  provider?: DocsSiteFeedbackProvider
  promptLabel?: string
  positiveLabel?: string
  negativeLabel?: string
  thanksLabel?: string
  githubIssueUrl?: string
}

export type DocsSiteSeoConfig = {
  siteUrl?: string
  titleTemplate?: string
  defaultDescription?: string
  defaultOgImage?: string
}

export type DocsSiteRemoteImagePolicy = 'allow' | 'block'

export type DocsSiteImageConfig = {
  remote?: DocsSiteRemoteImagePolicy
  requireAlt?: boolean
  lazy?: boolean
  captions?: boolean
}

export type DocsSiteConfig = {
  name: string
  title: string
  description?: string
  url?: string
  brand: DocsSiteBrandConfig
  github?: DocsSiteGithubConfig
  nav?: DocsSiteNavConfig
  pageActions?: DocsSitePageActionsConfig
  search?: DocsSiteSearchConfig
  feedback?: DocsSiteFeedbackConfig
  seo?: DocsSiteSeoConfig
  images?: DocsSiteImageConfig
}

export function defineDocsSiteConfig(config: DocsSiteConfig) {
  return config
}
