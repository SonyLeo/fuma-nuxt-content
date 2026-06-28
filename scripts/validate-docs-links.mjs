import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DOC_EXTENSION_RE = /\.(?:md|mdx)$/i
const EXTERNAL_HREF_RE = /^[a-z][a-z\d+.-]*:/i
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const CONTENT_DIR = path.join(ROOT, 'content')

function toPosixPath(value) {
  return value.replace(/\\/g, '/')
}

function splitPathSuffix(value) {
  const suffixIndex = value.search(/[?#]/)

  if (suffixIndex < 0) {
    return {
      pathname: value,
      search: '',
      hash: '',
    }
  }

  const pathname = value.slice(0, suffixIndex)
  const suffix = value.slice(suffixIndex)
  const hashIndex = suffix.indexOf('#')

  if (hashIndex < 0) {
    return {
      pathname,
      search: suffix.startsWith('?') ? suffix : '',
      hash: suffix.startsWith('#') ? suffix.slice(1) : '',
    }
  }

  return {
    pathname,
    search: suffix.slice(0, hashIndex),
    hash: suffix.slice(hashIndex + 1),
  }
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

function getPathSegments(value) {
  if (!value || value === '/') {
    return []
  }

  return value.replace(/^\//, '').split('/')
}

function normalizeDocsRoutePath(value = '/') {
  const normalized = (value.startsWith('/') ? value : `/${value}`).replace(
    /\/+/g,
    '/',
  )
  const segments = getPathSegments(normalized)
    .map((segment) => decodeRouteSegment(segment.trim()))
    .filter(Boolean)
    .map(encodeRouteSegment)

  return segments.length > 0 ? `/${segments.join('/')}` : '/'
}

function normalizeDocsSourcePath(value = '/') {
  const normalized = value
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(DOC_EXTENSION_RE, '')
    .replace(/\/index$/, '')

  return normalized ? `/${normalized}` : '/'
}

function getDirnameFromPath(value) {
  const segments = getPathSegments(value)
  return segments.slice(0, -1).join('/')
}

function resolveDocsRoutePath(sourcePath, pageMeta = {}) {
  const normalizedSourcePath = normalizeDocsRoutePath(sourcePath)
  const slug = pageMeta.slug?.trim()

  if (!slug) {
    return normalizedSourcePath
  }

  if (slug.startsWith('/')) {
    return normalizeDocsRoutePath(slug)
  }

  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '')

  if (!normalizedSlug) {
    return normalizedSourcePath
  }

  const baseDir = getDirnameFromPath(normalizedSourcePath)
  const normalizedSlugPath = normalizeDocsRoutePath(normalizedSlug)

  return normalizeDocsRoutePath(
    `/${[baseDir, normalizedSlugPath.replace(/^\//, '')].filter(Boolean).join('/')}`,
  )
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---\n') && !markdown.startsWith('---\r\n')) {
    return {}
  }

  const match = /^---\r?\n(?<body>[\s\S]*?)\r?\n---\r?\n/.exec(markdown)
  const frontmatter = match?.groups?.body

  if (!frontmatter) {
    return {}
  }

  const data = {}

  for (const line of frontmatter.split(/\r?\n/)) {
    const entry = /^(?<key>[A-Za-z][\w-]*):\s*(?<value>.*)$/.exec(line)

    if (!entry?.groups?.key) {
      continue
    }

    const rawValue = entry.groups.value.trim()

    if (rawValue === 'true') {
      data[entry.groups.key] = true
      continue
    }

    if (rawValue === 'false') {
      data[entry.groups.key] = false
      continue
    }

    data[entry.groups.key] = rawValue.replace(/^['"]|['"]$/g, '')
  }

  return data
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
}

function slugifyHeading(value) {
  return value
    .toLowerCase()
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
}

function collectAnchors(markdown) {
  const anchors = new Set()
  let inFence = false

  for (const line of stripFrontmatter(markdown).split(/\r?\n/)) {
    if (/^\s*```/.test(line) || /^\s*~~~/.test(line)) {
      inFence = !inFence
      continue
    }

    if (inFence) {
      continue
    }

    const heading = /^(?<level>#{1,6})\s+(?<text>.+?)\s*#*\s*$/.exec(line)
    if (heading?.groups?.text) {
      const slug = slugifyHeading(heading.groups.text)
      if (slug) {
        anchors.add(slug)
      }
    }

    for (const match of line.matchAll(/\bid=["'](?<id>[^"']+)["']/g)) {
      if (match.groups?.id) {
        anchors.add(match.groups.id)
      }
    }
  }

  return anchors
}

function cleanMarkdownTarget(rawTarget) {
  const trimmed = rawTarget.trim()

  if (trimmed.startsWith('<') && trimmed.includes('>')) {
    return trimmed.slice(1, trimmed.indexOf('>'))
  }

  return trimmed.split(/\s+(?=(?:"|'))/)[0]
}

function collectLinks(markdown) {
  const links = []
  let inFence = false
  const lines = stripFrontmatter(markdown).split(/\r?\n/)

  lines.forEach((line, index) => {
    if (/^\s*```/.test(line) || /^\s*~~~/.test(line)) {
      inFence = !inFence
      return
    }

    if (inFence) {
      return
    }

    for (const match of line.matchAll(
      /(?<image>!)?\[[^\]]+]\((?<target>[^)]+)\)/g,
    )) {
      if (match.groups?.image || !match.groups?.target) {
        continue
      }

      links.push({
        line: index + 1,
        target: cleanMarkdownTarget(match.groups.target),
        kind: 'markdown',
      })
    }

    for (const match of line.matchAll(/\bhref=["'](?<target>[^"']+)["']/g)) {
      if (!match.groups?.target) {
        continue
      }

      links.push({
        line: index + 1,
        target: match.groups.target,
        kind: 'href',
      })
    }
  })

  return links
}

async function walkDocsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await walkDocsFiles(entryPath)))
      continue
    }

    if (entry.isFile() && DOC_EXTENSION_RE.test(entry.name)) {
      files.push(entryPath)
    }
  }

  return files
}

function resolveRelativeSourcePath(currentSourcePath, target) {
  const { pathname, search, hash } = splitPathSuffix(target)
  const baseSegments = normalizeDocsSourcePath(currentSourcePath)
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

  return `${normalizeDocsSourcePath(`/${baseSegments.join('/')}`)}${search}${hash ? `#${hash}` : ''}`
}

function isExternalHref(target) {
  return EXTERNAL_HREF_RE.test(target) || target.startsWith('//')
}

function isExternalHrefValid(target) {
  if (target.startsWith('//')) {
    return /^\/\/[^\s/$.?#].[^\s]*$/i.test(target)
  }

  try {
    const url = new URL(target)
    return Boolean(url.protocol)
  } catch {
    return false
  }
}

function hasDocsFileExtension(value) {
  return DOC_EXTENSION_RE.test(splitPathSuffix(value).pathname)
}

function hasAnchor(page, hash) {
  if (page.anchors.has(hash)) {
    return true
  }

  try {
    return page.anchors.has(decodeURIComponent(hash))
  } catch {
    return false
  }
}

function reportFailure(failures, file, link, target, reason) {
  failures.push({
    file: toPosixPath(path.relative(ROOT, file)),
    line: link.line,
    target,
    reason,
  })
}

function validateLink(link, page, indexes, failures) {
  const target = link.target.trim()

  if (!target || target === '#') {
    return
  }

  if (isExternalHref(target)) {
    if (!isExternalHrefValid(target)) {
      reportFailure(failures, page.file, link, target, 'Invalid external URL')
    }
    return
  }

  const { pathname, hash } = splitPathSuffix(target)

  if (!pathname && hash) {
    if (!hasAnchor(page, hash)) {
      reportFailure(failures, page.file, link, target, 'Missing hash anchor')
    }
    return
  }

  if (target.startsWith('./') || target.startsWith('../')) {
    const sourcePath = resolveRelativeSourcePath(page.sourcePath, target)
    const resolved = splitPathSuffix(sourcePath)
    const normalizedSourcePath = normalizeDocsSourcePath(resolved.pathname)
    const targetPage = indexes.bySourcePath.get(normalizedSourcePath)

    if (!targetPage) {
      reportFailure(
        failures,
        page.file,
        link,
        target,
        'Missing docs source file',
      )
      return
    }

    if (resolved.hash && !hasAnchor(targetPage, resolved.hash)) {
      reportFailure(failures, page.file, link, target, 'Missing hash anchor')
    }
    return
  }

  if (target.startsWith('/')) {
    const targetPage = hasDocsFileExtension(target)
      ? indexes.bySourcePath.get(normalizeDocsSourcePath(pathname))
      : indexes.byRoutePath.get(normalizeDocsRoutePath(pathname))

    if (!targetPage) {
      reportFailure(failures, page.file, link, target, 'Missing docs route')
      return
    }

    if (hash && !hasAnchor(targetPage, hash)) {
      reportFailure(failures, page.file, link, target, 'Missing hash anchor')
    }
  }
}

async function createDocsPages() {
  const files = await walkDocsFiles(CONTENT_DIR)
  const pages = []

  for (const file of files) {
    const markdown = await readFile(file, 'utf8')
    const relativePath = toPosixPath(path.relative(CONTENT_DIR, file))
    const sourcePath = normalizeDocsSourcePath(relativePath)
    const meta = parseFrontmatter(markdown)

    pages.push({
      file,
      sourcePath,
      routePath: resolveDocsRoutePath(sourcePath, meta),
      anchors: collectAnchors(markdown),
      links: collectLinks(markdown),
    })
  }

  return pages
}

async function main() {
  if (!existsSync(CONTENT_DIR)) {
    throw new Error(`Content directory not found: ${CONTENT_DIR}`)
  }

  const pages = await createDocsPages()
  const indexes = {
    bySourcePath: new Map(pages.map((page) => [page.sourcePath, page])),
    byRoutePath: new Map(pages.map((page) => [page.routePath, page])),
  }
  const failures = []

  for (const page of pages) {
    for (const link of page.links) {
      validateLink(link, page, indexes, failures)
    }
  }

  if (failures.length > 0) {
    console.error('Docs link validation failed:')
    for (const failure of failures) {
      console.error(
        `- ${failure.file}:${failure.line} ${failure.target} (${failure.reason})`,
      )
    }
    process.exitCode = 1
    return
  }

  const linkCount = pages.reduce((total, page) => total + page.links.length, 0)
  console.log(
    `Docs link validation passed: ${pages.length} pages, ${linkCount} links.`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
