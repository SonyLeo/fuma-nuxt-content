function getPathSegments(value) {
  if (!value || value === '/') {
    return []
  }

  return value.replace(/^\//, '').split('/')
}

function decodeRouteSegment(segment) {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

function encodeRouteSegment(segment) {
  return encodeURI(segment)
}

/** @param {string | undefined} value */
export function normalizeDocsSourcePath(value) {
  if (!value) {
    return '/'
  }

  const normalized = value.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
  return normalized ? `/${normalized}` : '/'
}

/** @param {string | undefined} value */
export function normalizeDocsRoutePath(value) {
  if (!value) {
    return '/'
  }

  const normalized = (value.startsWith('/') ? value : `/${value}`).replace(
    /\/+/g,
    '/',
  )
  const segments = getPathSegments(normalized)
    .map((segment) => decodeRouteSegment(segment.trim()))
    .filter((segment) => segment.length > 0)
    .map(encodeRouteSegment)

  return segments.length > 0 ? `/${segments.join('/')}` : '/'
}

/**
 * @param {string} sourcePath
 * @param {{ slug?: string }} [pageMeta]
 */
export function resolveDocsRoutePath(sourcePath, pageMeta) {
  const normalizedSourcePath = normalizeDocsSourcePath(sourcePath)
  const defaultRoutePath = normalizeDocsRoutePath(
    normalizedSourcePath.replace(/\/index$/, '') || '/',
  )
  const slug = pageMeta?.slug?.trim()

  if (!slug) {
    return defaultRoutePath
  }

  if (slug.startsWith('/')) {
    return normalizeDocsRoutePath(slug)
  }

  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '')
  if (!normalizedSlug) {
    return defaultRoutePath
  }

  const sourceSegments = getPathSegments(normalizedSourcePath)
  const baseDir = sourceSegments.slice(0, -1).join('/')
  const normalizedSlugPath = normalizeDocsRoutePath(normalizedSlug)

  return normalizeDocsRoutePath(
    `/${[baseDir, normalizedSlugPath.replace(/^\//, '')].filter(Boolean).join('/')}`,
  )
}
