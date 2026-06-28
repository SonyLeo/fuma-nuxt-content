import type { DocsLayoutProps } from '~/types/docs'
import type {
  DocsSiteConfig,
  DocsSiteGithubConfig,
} from '~/types/docs-site'

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
): Pick<
  DocsLayoutProps,
  'title' | 'headline' | 'brand' | 'githubUrl' | 'links' | 'nav'
> {
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
