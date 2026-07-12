function splitPath(value) {
  return value.replace(/\\/g, '/').split('/')
}

function assertPathInput(value, label) {
  if (typeof value !== 'string' || value.includes('\0')) {
    throw new Error(`Invalid docs ${label}: ${String(value)}`)
  }
}

function decodePathSegment(segment, label) {
  let decoded
  try {
    decoded = decodeURIComponent(segment)
  } catch {
    throw new Error(`Malformed docs ${label} encoding: ${segment}`)
  }

  decoded = decoded.normalize('NFC')
  if (
    decoded === '.' ||
    decoded === '..' ||
    decoded.includes('/') ||
    decoded.includes('\\')
  ) {
    throw new Error(`Invalid docs ${label} segment: ${segment}`)
  }
  return decoded
}

function normalizePathSegments(value, label) {
  assertPathInput(value, label)
  const segments = splitPath(value)
  for (const segment of segments) {
    if (segment === '.' || segment === '..') {
      throw new Error(`Invalid docs ${label} segment: ${segment}`)
    }
  }
  return segments
    .filter(Boolean)
    .map((segment) => decodePathSegment(segment, label))
}

/** @param {string | undefined} value */
export function normalizeDocsSourcePath(value) {
  if (!value) return '/'
  const segments = normalizePathSegments(value, 'source path')
  return segments.length > 0 ? `/${segments.join('/')}` : '/'
}

/** @param {string | undefined} value */
export function normalizeDocsRoutePath(value) {
  if (!value) return '/'
  const pathname = value.split(/[?#]/, 1)[0]
  const segments = normalizePathSegments(pathname, 'route path').map(
    (segment) => encodeURIComponent(segment),
  )
  return segments.length > 0 ? `/${segments.join('/')}` : '/'
}

/** @param {string} sourcePath @param {{ slug?: string }} [pageMeta] */
export function resolveDocsRoutePath(sourcePath, pageMeta) {
  const normalizedSourcePath = normalizeDocsSourcePath(sourcePath)
  const defaultRoutePath = normalizeDocsRoutePath(
    normalizedSourcePath.replace(/\/index$/, '') || '/',
  )
  const slug = pageMeta?.slug?.trim()
  if (!slug) return defaultRoutePath
  if (slug.startsWith('/')) return normalizeDocsRoutePath(slug)

  const normalizedSlugPath = normalizeDocsRoutePath(slug)
  if (normalizedSlugPath === '/') return defaultRoutePath
  const sourceSegments = normalizedSourcePath.slice(1).split('/')
  const baseDir = sourceSegments.slice(0, -1).join('/')
  return normalizeDocsRoutePath(
    `/${[baseDir, normalizedSlugPath.slice(1)].filter(Boolean).join('/')}`,
  )
}

/** @param {{ path: string, stem?: string, slug?: string, docsMetadata?: { slug?: string, [key: string]: unknown } }} record */
export function resolveDocsPageIdentity(record) {
  if (!record || typeof record.path !== 'string' || !record.path) {
    throw new Error('Invalid docs content query path')
  }
  const sourcePath = normalizeDocsSourcePath(record.stem || record.path)
  const slug = record.docsMetadata?.slug
  return {
    contentPath: record.path,
    sourcePath,
    routePath: resolveDocsRoutePath(sourcePath, { slug }),
    stem: record.stem,
    slug,
  }
}

/** @param {Array<{ path: string, stem?: string, slug?: string, docsMetadata?: { slug?: string, [key: string]: unknown } }>} records */
export function createDocsIdentityIndex(records = []) {
  const entries = records.map((record) => ({
    record,
    identity: resolveDocsPageIdentity(record),
  }))
  const byRoutePath = new Map()
  const bySourcePath = new Map()
  const routeSources = new Map()

  for (const entry of entries) {
    const { routePath, sourcePath } = entry.identity
    const sources = routeSources.get(routePath) ?? []
    sources.push(sourcePath)
    routeSources.set(routePath, sources)
    if (!byRoutePath.has(routePath)) byRoutePath.set(routePath, entry)
    if (bySourcePath.has(sourcePath)) {
      throw new Error(
        `Duplicate docs source identities detected: ${sourcePath}`,
      )
    }
    bySourcePath.set(sourcePath, entry)
  }

  const collisions = [...routeSources].filter(
    ([, sources]) => sources.length > 1,
  )
  if (collisions.length > 0) {
    const detail = collisions
      .map(
        ([routePath, sources]) =>
          `${routePath}: ${[...sources].sort().join(', ')}`,
      )
      .join('; ')
    throw new Error(`Duplicate docs route paths detected: ${detail}`)
  }

  return {
    entries,
    byRoutePath,
    bySourcePath,
    getByRoutePath: (routePath) => {
      try {
        return byRoutePath.get(normalizeDocsRoutePath(routePath)) ?? null
      } catch {
        return null
      }
    },
    getBySourcePath: (sourcePath) =>
      bySourcePath.get(normalizeDocsSourcePath(sourcePath)) ?? null,
  }
}
