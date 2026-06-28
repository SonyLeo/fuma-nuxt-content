import type { DocsPageRecord } from '~/types/docs'
import {
  normalizeDocsRoutePath,
  resolveDocsRecordSourcePath,
  resolveDocsRoutePath,
} from '~/utils/docs-navigation'

export type DocsResolvedLink = {
  href: string
  external: boolean
  hashOnly: boolean
  target?: string
  rel?: string
}

export type DocsLinkActiveMode = 'url' | 'nested-url' | 'none'

export type ResolveDocsLinkOptions = {
  currentSourcePath?: string | null
  pages?: DocsPageRecord[] | null
  external?: boolean
  target?: string
  rel?: string
}

const DOC_FILE_EXTENSION_RE = /\.(?:md|mdx)$/i

function splitPathSuffix(value: string) {
  const suffixIndex = value.search(/[?#]/)

  if (suffixIndex < 0) {
    return {
      pathname: value,
      suffix: '',
    }
  }

  return {
    pathname: value.slice(0, suffixIndex),
    suffix: value.slice(suffixIndex),
  }
}

function hasDocsFileExtension(value: string) {
  const { pathname } = splitPathSuffix(value)
  return DOC_FILE_EXTENSION_RE.test(pathname)
}

export function isExternalDocsHref(href: string) {
  return /^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//')
}

function normalizeDocsSourcePath(path: string) {
  const { pathname, suffix } = splitPathSuffix(path)
  const withoutExtension = pathname.replace(DOC_FILE_EXTENSION_RE, '')
  const withoutIndex = withoutExtension.replace(/\/index$/, '')
  return `${normalizeDocsRoutePath(withoutIndex || '/')}${suffix}`
}

function resolveRelativePath(basePath: string, href: string) {
  const { pathname, suffix } = splitPathSuffix(href)
  const baseSegments = normalizeDocsSourcePath(basePath)
    .replace(/[#?].*$/, '')
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean)

  baseSegments.pop()

  for (const segment of pathname.split('/')) {
    if (!segment || segment === '.') {
      continue
    }

    if (segment === '..') {
      baseSegments.pop()
      continue
    }

    baseSegments.push(segment)
  }

  return normalizeDocsSourcePath(`/${baseSegments.join('/')}${suffix}`)
}

function resolveRouteFromSourcePath(
  sourcePath: string,
  pages: DocsPageRecord[] | null | undefined,
) {
  const { pathname, suffix } = splitPathSuffix(sourcePath)
  const normalizedSource = normalizeDocsSourcePath(pathname)
  const match = (pages ?? []).find((page) => {
    return normalizeDocsSourcePath(resolveDocsRecordSourcePath(page)) === normalizedSource
  })

  if (!match) {
    return `${normalizedSource}${suffix}`
  }

  return `${resolveDocsRoutePath(resolveDocsRecordSourcePath(match), match)}${suffix}`
}

export function resolveDocsLink(
  href: string | null | undefined,
  options: ResolveDocsLinkOptions = {},
): DocsResolvedLink {
  const rawHref = href?.trim() || '#'
  const external = options.external ?? isExternalDocsHref(rawHref)
  const hashOnly = rawHref.startsWith('#')

  if (external) {
    return {
      href: rawHref,
      external: true,
      hashOnly: false,
      target: options.target ?? '_blank',
      rel: options.rel ?? 'noreferrer noopener',
    }
  }

  if (hashOnly) {
    return {
      href: rawHref,
      external: false,
      hashOnly: true,
      target: options.target,
      rel: options.rel,
    }
  }

  const resolvedHref =
    rawHref.startsWith('./') || rawHref.startsWith('../')
      ? resolveRouteFromSourcePath(
          resolveRelativePath(options.currentSourcePath ?? '/', rawHref),
          options.pages,
        )
      : rawHref.startsWith('/')
        ? hasDocsFileExtension(rawHref)
          ? resolveRouteFromSourcePath(rawHref, options.pages)
          : normalizeDocsSourcePath(rawHref)
        : rawHref

  return {
    href: resolvedHref,
    external: false,
    hashOnly: false,
    target: options.target,
    rel: options.rel,
  }
}

export function isDocsLinkActive(
  href: string | null | undefined,
  currentPath: string,
  mode: DocsLinkActiveMode = 'url',
) {
  if (!href || mode === 'none' || isExternalDocsHref(href)) {
    return false
  }

  const { pathname } = splitPathSuffix(href)
  const normalizedHref = normalizeDocsRoutePath(pathname)
  const normalizedCurrent = normalizeDocsRoutePath(currentPath)

  if (mode === 'nested-url') {
    return (
      normalizedCurrent === normalizedHref ||
      normalizedCurrent.startsWith(`${normalizedHref}/`)
    )
  }

  return normalizedCurrent === normalizedHref
}
