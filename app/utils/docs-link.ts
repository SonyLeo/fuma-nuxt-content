import type { DocsPageRecord } from '~/types/docs'
import {
  createDocsIdentityIndex,
  normalizeDocsRoutePath,
  normalizeDocsSourcePath,
  resolveDocsRoutePath,
} from '#shared/docs-identity.js'

export type DocsResolvedLink = {
  href: string
  external: boolean
  hashOnly: boolean
  unsafe: boolean
  sourcePath?: string
  sourceExists?: boolean
  target?: string
  rel?: string
}

export type DocsLinkActiveMode = 'url' | 'nested-url' | 'none'

export type ResolveDocsLinkOptions = {
  currentSourcePath?: string | null
  pages?: DocsPageRecord[] | null
  external?: boolean
  authored?: boolean
  target?: string
  rel?: string
}

const DOC_FILE_EXTENSION_RE = /\.(?:md|mdx)$/i
const UNSAFE_AUTHORED_SCHEME_RE = /^(?:data|javascript|vbscript):/i

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
  const tokens = rel?.split(/\s+/).filter(Boolean) ?? []
  const normalizedTokens = new Set(tokens.map((token) => token.toLowerCase()))

  for (const token of ['noreferrer', 'noopener']) {
    if (!normalizedTokens.has(token)) {
      tokens.push(token)
      normalizedTokens.add(token)
    }
  }

  return tokens.join(' ')
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
  const match = createDocsIdentityIndex(pages ?? []).getBySourcePath(
    normalizedSource,
  )

  if (!match) {
    return {
      href: `${resolveDocsRoutePath(normalizedSource)}${suffix}`,
      sourcePath: normalizedSource,
      sourceExists: false,
    }
  }

  return {
    href: `${match.identity.routePath}${suffix}`,
    sourcePath: normalizedSource,
    sourceExists: true,
  }
}

function normalizeRouteHref(href: string) {
  const { pathname, suffix } = splitPathSuffix(href)

  return `${normalizeDocsRoutePath(pathname)}${suffix}`
}

export function resolveDocsLink(
  href: string | null | undefined,
  options: ResolveDocsLinkOptions = {},
): DocsResolvedLink {
  const rawHref = href?.trim() || '#'
  const unsafe = Boolean(
    options.authored && UNSAFE_AUTHORED_SCHEME_RE.test(rawHref),
  )

  if (unsafe) {
    return {
      href: '#',
      external: false,
      hashOnly: true,
      unsafe: true,
      target: options.target,
      rel: options.rel,
    }
  }

  const external = options.external ?? isExternalDocsHref(rawHref)
  const hashOnly = rawHref.startsWith('#')

  if (external) {
    return {
      href: rawHref,
      external: true,
      hashOnly: false,
      unsafe: false,
      target: options.target ?? '_blank',
      rel: mergeExternalRel(options.rel),
    }
  }

  if (hashOnly) {
    return {
      href: rawHref,
      external: false,
      hashOnly: true,
      unsafe: false,
      target: options.target,
      rel: options.rel,
    }
  }

  let resolvedHref: string
  let sourceResolution:
    | ReturnType<typeof resolveRouteFromSourcePath>
    | undefined

  if (rawHref.startsWith('?')) {
    resolvedHref = rawHref
  } else if (isExternalDocsHref(rawHref)) {
    resolvedHref = rawHref
  } else if (rawHref.startsWith('/')) {
    if (hasDocsFileExtension(rawHref)) {
      sourceResolution = resolveRouteFromSourcePath(rawHref, options.pages)
      resolvedHref = sourceResolution.href
    } else {
      resolvedHref = normalizeRouteHref(rawHref)
    }
  } else {
    sourceResolution = resolveRouteFromSourcePath(
      resolveRelativePath(options.currentSourcePath ?? '/', rawHref),
      options.pages,
    )
    resolvedHref = sourceResolution.href
  }

  return {
    href: resolvedHref,
    external: false,
    hashOnly: false,
    unsafe: false,
    sourcePath: sourceResolution?.sourcePath,
    sourceExists: sourceResolution?.sourceExists,
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
