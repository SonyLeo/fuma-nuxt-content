import type { DocsThemeConfig } from '~/types/docs-theme'
import type {
  DocsDirection,
  DocsHomeLayoutProps,
  DocsLayoutProps,
  DocsNavLink,
  DocsNavOptions,
  DocsResolvedRootProviderProps,
} from '~/types/docs'

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
  openInAi?: boolean
}

export type DocsSiteSearchProvider = 'local'

export type DocsSiteSearchConfig = {
  enabled?: boolean
  provider?: DocsSiteSearchProvider
  label?: string
  placeholder?: string
  emptyLabel?: string
}

export type DocsSiteLanguageConfig = {
  enabled?: boolean
  label?: string
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
  direction?: DocsDirection
  brand: DocsSiteBrandConfig
  github?: DocsSiteGithubConfig
  nav?: DocsSiteNavConfig
  pageActions?: DocsSitePageActionsConfig
  search?: DocsSiteSearchConfig
  language?: DocsSiteLanguageConfig
  feedback?: DocsSiteFeedbackConfig
  seo?: DocsSiteSeoConfig
  images?: DocsSiteImageConfig
  theme?: DocsThemeConfig
}

export type DocsSiteLayoutProps = Pick<
  DocsLayoutProps,
  'title' | 'headline' | 'brand' | 'githubUrl' | 'links' | 'nav'
>

export type DocsSiteHomeLayoutProps = Omit<DocsHomeLayoutProps, 'currentPath'>

export type DocsSiteResolvedPageActionsConfig =
  Required<DocsSitePageActionsConfig>

export type DocsSiteResolvedSearchConfig = DocsSiteSearchConfig & {
  enabled: boolean
}

export type DocsSiteResolvedFeedbackConfig = DocsSiteFeedbackConfig & {
  enabled: boolean
}

export type DocsSiteSeoDefaults = {
  siteTitle: string
  siteUrl?: string
  titleTemplate?: string
  defaultDescription?: string
  defaultOgImage?: string
}

export type DocsSiteAdapter = {
  root: DocsResolvedRootProviderProps
  docsLayout: DocsSiteLayoutProps
  homeLayout: DocsSiteHomeLayoutProps
  page: {
    actions: DocsSiteResolvedPageActionsConfig
    search: DocsSiteResolvedSearchConfig
    feedback: DocsSiteResolvedFeedbackConfig
    github?: DocsSiteGithubConfig
    seo: DocsSiteSeoDefaults
  }
  theme: DocsThemeConfig | undefined
  content: {
    name: string
    title: string
    description?: string
  }
}

export function defineDocsSiteConfig(config: DocsSiteConfig) {
  return config
}
