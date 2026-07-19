import type { DocsPageAction, DocsPageActionState } from '~/types/docs-actions'
import type {
  DocsSiteAdapter,
  DocsSiteConfig,
  DocsSiteGithubConfig,
  DocsSiteHomeLayoutProps,
  DocsSiteLayoutProps,
  DocsSiteResolvedPageActionsConfig,
} from '~/types/docs-site'
import { resolveDocsRootProviderProps } from '~/utils/docs-root-provider'
import { resolveDocsThemeConfig } from '~/types/docs-theme'

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '')
}

function encodeGitPath(path: string) {
  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export function getDocsGithubRepositoryUrl(
  github: DocsSiteGithubConfig | undefined,
) {
  if (!github) {
    return undefined
  }

  return `https://github.com/${github.owner}/${github.repo}`
}

export function createDocsSiteLayoutProps(
  config: DocsSiteConfig,
): DocsSiteLayoutProps {
  return {
    title: config.title,
    headline: config.nav?.title ?? config.title,
    brand: {
      label: config.brand.label,
      mark: config.brand.mark,
      href: '/',
    },
    githubUrl: getDocsGithubRepositoryUrl(config.github),
    links: config.nav?.links ?? [],
    nav: {
      title: config.nav?.title,
      enabled: config.nav?.enabled ?? true,
      tabs: config.nav?.tabs ?? [],
    },
  }
}

export function createDocsSiteHomeLayoutProps(
  config: DocsSiteConfig,
): DocsSiteHomeLayoutProps {
  const layout = createDocsSiteLayoutProps(config)

  return {
    title: layout.title,
    brand: layout.brand,
    githubUrl: layout.githubUrl,
    links: layout.links,
  }
}

export function createDocsSiteAdapter(config: DocsSiteConfig): DocsSiteAdapter {
  const searchProvider = config.search?.provider ?? 'local'
  const search = {
    ...config.search,
    enabled: config.search?.enabled !== false,
    provider: searchProvider,
    endpoint: config.search?.endpoint?.trim() || '/api/search',
    delayMs: config.search?.delayMs ?? (searchProvider === 'api' ? 150 : 0),
    limit: config.search?.limit ?? 8,
  }

  return {
    root: resolveDocsRootProviderProps({
      dir: config.direction,
      search,
      language: config.language,
    }),
    docsLayout: createDocsSiteLayoutProps(config),
    homeLayout: createDocsSiteHomeLayoutProps(config),
    page: {
      actions: {
        source: config.pageActions?.source !== false,
        edit: config.pageActions?.edit === true,
        copyMarkdown: config.pageActions?.copyMarkdown === true,
        openInAi: config.pageActions?.openInAi === true,
      },
      search,
      feedback: {
        ...config.feedback,
        enabled: config.feedback?.enabled === true,
      },
      github: config.github,
      seo: {
        siteTitle: config.title,
        siteUrl: config.seo?.siteUrl,
        titleTemplate: config.seo?.titleTemplate,
        defaultDescription:
          config.seo?.defaultDescription ?? config.description,
        defaultOgImage: config.seo?.defaultOgImage,
      },
    },
    theme: resolveDocsThemeConfig(config.theme),
    content: {
      name: config.name,
      title: config.title,
      description: config.description,
    },
  }
}

export function createDocsSitePageActions(options: {
  config: DocsSiteResolvedPageActionsConfig
  github?: DocsSiteGithubConfig
  sourcePath?: string | null
  canonicalUrl: string
  copyMarkdownState: DocsPageActionState
}): DocsPageAction[] {
  const actions: DocsPageAction[] = []
  const sourceUrl = getDocsGithubSourceUrl(options.github, options.sourcePath)
  const editUrl = getDocsGithubEditUrl(options.github, options.sourcePath)

  if (options.config.source && sourceUrl) {
    actions.push({
      id: 'open-github',
      type: 'link',
      label: 'Open in GitHub',
      href: sourceUrl,
      external: true,
      icon: 'github',
      ariaLabel: 'Open source on GitHub',
    })
  }

  if (options.config.edit && editUrl) {
    actions.push({
      id: 'edit-page',
      type: 'link',
      label: 'Edit page',
      href: editUrl,
      external: true,
      icon: 'edit',
      ariaLabel: 'Edit this page on GitHub',
    })
  }

  if (options.config.copyMarkdown && options.sourcePath) {
    actions.push({
      id: 'copy-markdown',
      type: 'button',
      label: 'Copy Markdown',
      icon: 'copy',
      ariaLabel: 'Copy Markdown source',
      state: options.copyMarkdownState,
      disabled: options.copyMarkdownState === 'loading',
    })
  }

  if (options.config.openInAi) {
    const prompt = createPageActionPrompt(options.canonicalUrl)

    actions.push(
      {
        id: 'open-scira',
        type: 'link',
        label: 'Open in Scira AI',
        href: withSearchParams('https://scira.ai/', {
          q: prompt,
        }),
        external: true,
        ariaLabel: 'Open this page in Scira AI',
      },
      {
        id: 'open-chatgpt',
        type: 'link',
        label: 'Open in ChatGPT',
        href: withSearchParams('https://chatgpt.com/', {
          prompt,
          hints: 'search',
        }),
        external: true,
        ariaLabel: 'Open this page in ChatGPT',
      },
      {
        id: 'open-claude',
        type: 'link',
        label: 'Open in Claude',
        href: withSearchParams('https://claude.ai/new', {
          q: prompt,
        }),
        external: true,
        ariaLabel: 'Open this page in Claude',
      },
      {
        id: 'open-cursor',
        type: 'link',
        label: 'Open in Cursor',
        href: withSearchParams('https://cursor.com/link/prompt', {
          text: prompt,
        }),
        external: true,
        ariaLabel: 'Open this page in Cursor',
      },
    )
  }

  return actions
}

function createPageActionPrompt(url: string) {
  return `Read ${url}, I want to ask questions about it.`
}

function withSearchParams(url: string, params: Record<string, string>) {
  return `${url}?${new URLSearchParams(params)}`
}

export function resolveDocsGithubFilePath(
  github: DocsSiteGithubConfig,
  sourcePath: string,
) {
  const normalizedSource = trimSlashes(sourcePath) || 'index'
  const normalizedContentDir = trimSlashes(github.contentDir)
  const markdownPath = /\.(?:md|mdx)$/i.test(normalizedSource)
    ? normalizedSource
    : `${normalizedSource}.md`

  return [normalizedContentDir, markdownPath].filter(Boolean).join('/')
}

export function getDocsGithubSourceUrl(
  github: DocsSiteGithubConfig | undefined,
  sourcePath: string | null | undefined,
) {
  if (!github || !sourcePath) {
    return undefined
  }

  const filePath = encodeGitPath(resolveDocsGithubFilePath(github, sourcePath))
  const baseUrl =
    github.sourceBaseUrl ??
    `https://github.com/${github.owner}/${github.repo}/blob/${github.branch}`

  return `${baseUrl.replace(/\/+$/, '')}/${filePath}`
}

export function getDocsGithubEditUrl(
  github: DocsSiteGithubConfig | undefined,
  sourcePath: string | null | undefined,
) {
  if (!github || !sourcePath) {
    return undefined
  }

  const filePath = encodeGitPath(resolveDocsGithubFilePath(github, sourcePath))
  const baseUrl =
    github.editBaseUrl ??
    `https://github.com/${github.owner}/${github.repo}/edit/${github.branch}`

  return `${baseUrl.replace(/\/+$/, '')}/${filePath}`
}
