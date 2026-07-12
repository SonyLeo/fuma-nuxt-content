import type { DocsPageRecord } from '~/types/docs'
import { resolveDocsRecordSourcePath } from '~/utils/docs-navigation'
import {
  normalizeDocsRoutePath,
  normalizeDocsSourcePath,
  resolveDocsRoutePath,
} from '#shared/docs-identity.js'

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

function mergeExternalRel(rel?: string) {
  return [
    ...new Set([
      ...(rel?.split(/\s+/).filter(Boolean) ?? []),
      'noreferrer',
      'noopener',
    ]),
  ].join(' ')
}

export function isExternalDocsHref(href: string) {
  return /^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//')
}

function normalizeDocsFileSourcePath(path: string) {
  const { pathname, suffix } = splitPathSuffix(path)
  const withoutExtension = pathname.replace(DOC_FILE_EXTENSION_RE, '')
  return `${normalizeDocsSourcePath(withoutExtension)}${suffix}`
}

function resolveRelativePath(basePath: string, href: string) {
  const { pathname, suffix } = splitPathSuffix(href)
  const baseSegments = normalizeDocsFileSourcePath(basePath)
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

  return normalizeDocsFileSourcePath(`/${baseSegments.join('/')}${suffix}`)
}

function resolveRouteFromSourcePath(
  sourcePath: string,
  pages: DocsPageRecord[] | null | undefined,
) {
  const { pathname, suffix } = splitPathSuffix(sourcePath)
  const normalizedSource = normalizeDocsFileSourcePath(pathname)
  const match = (pages ?? []).find((page) => {
    return (
      normalizeDocsFileSourcePath(resolveDocsRecordSourcePath(page)) ===
      normalizedSource
    )
  })

  if (!match) {
    return `${normalizedSource}${suffix}`
  }

  return `${resolveDocsRoutePath(resolveDocsRecordSourcePath(match), match.docsMetadata)}${suffix}`
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
      rel: mergeExternalRel(options.rel),
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
          : normalizeDocsRoutePath(rawHref)
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
