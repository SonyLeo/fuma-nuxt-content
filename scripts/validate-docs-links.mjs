import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import ts from 'typescript'
import {
  createDocsIdentityIndex,
  normalizeDocsRoutePath,
  normalizeDocsSourcePath,
  resolveDocsRoutePath,
} from '../shared/docs-identity.js'

const DOC_EXTENSION_RE = /\.(?:md|mdx)$/i
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const CONTENT_DIR = path.resolve(process.argv[2] ?? path.join(ROOT, 'content'))
const require = createRequire(import.meta.url)

async function loadProjectTypeScriptModule(relativePath, aliases = {}) {
  const filename = path.resolve(ROOT, relativePath)
  const source = await readFile(filename, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText
  const module = { exports: {} }
  const localRequire = (id) => aliases[id] ?? require(id)

  new Function('require', 'exports', 'module', output)(
    localRequire,
    module.exports,
    module,
  )

  return module.exports
}

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

function normalizeDocsFileSourcePath(value = '/') {
  return normalizeDocsSourcePath(value.replace(DOC_EXTENSION_RE, ''))
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

async function collectAnchors(markdown, markdownSteps, markdownSemantics) {
  const parsed = await parseMarkdown(markdown, {
    configs: [markdownSemantics.default],
    remark: {
      plugins: {
        docsMarkdownSteps: {
          instance: markdownSteps.default,
        },
        docsMarkdownSemantics: {
          instance: markdownSemantics.default,
        },
      },
    },
  })
  const canonicalToc = parsed.data[markdownSemantics.docsCanonicalTocKey] ?? []

  return new Set(canonicalToc.map((heading) => heading.id))
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

async function walkMetaFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkMetaFiles(entryPath)))
    } else if (entry.isFile() && entry.name === 'meta.json') {
      files.push(entryPath)
    }
  }

  return files
}

async function validateMetaDirectories(markdownFiles) {
  const metaFiles = await walkMetaFiles(CONTENT_DIR)
  const failures = []

  for (const metaFile of metaFiles) {
    const directory = path.dirname(metaFile)
    const hasPage = markdownFiles.some((file) => {
      const relative = path.relative(directory, file)
      return (
        relative !== '' &&
        !relative.startsWith(`..${path.sep}`) &&
        relative !== '..'
      )
    })

    if (!hasPage) {
      const stem = normalizeDocsSourcePath(
        toPosixPath(path.relative(CONTENT_DIR, directory)),
      )
      failures.push(
        `${toPosixPath(path.relative(CONTENT_DIR, metaFile))} (directory stem ${stem}: meta-only directory is unsupported; add a content page or delete this meta file)`,
      )
    }
  }

  return failures
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

function validateLink(link, page, pages, indexes, failures, resolveDocsLink) {
  const target = link.target.trim()

  if (!target || target === '#') {
    return
  }

  const resolved = resolveDocsLink(target, {
    authored: true,
    currentSourcePath: page.sourcePath,
    pages,
  })

  if (resolved.unsafe) {
    reportFailure(failures, page.file, link, target, 'Unsafe authored scheme')
    return
  }

  if (resolved.external) {
    if (!isExternalHrefValid(resolved.href)) {
      reportFailure(failures, page.file, link, target, 'Invalid external URL')
    }
    return
  }

  const { pathname, hash } = splitPathSuffix(resolved.href)

  if (resolved.hashOnly) {
    if (!hasAnchor(page, hash)) {
      reportFailure(failures, page.file, link, target, 'Missing hash anchor')
    }
    return
  }

  if (!pathname) {
    return
  }

  if (resolved.sourcePath && !resolved.sourceExists) {
    reportFailure(failures, page.file, link, target, 'Missing docs source file')
    return
  }

  const targetPage = indexes.byRoutePath.get(normalizeDocsRoutePath(pathname))

  if (!targetPage) {
    reportFailure(failures, page.file, link, target, 'Missing docs route')
    return
  }

  if (hash && !hasAnchor(targetPage, hash)) {
    reportFailure(failures, page.file, link, target, 'Missing hash anchor')
  }
}

async function createDocsPages(files, markdownSteps, markdownSemantics) {
  const pages = []

  for (const file of files) {
    const markdown = await readFile(file, 'utf8')
    const relativePath = toPosixPath(path.relative(CONTENT_DIR, file))
    const sourcePath = normalizeDocsFileSourcePath(relativePath)
    const meta = parseFrontmatter(markdown)

    pages.push({
      file,
      path: sourcePath,
      stem: sourcePath,
      docsMetadata: meta,
      sourcePath,
      routePath: resolveDocsRoutePath(sourcePath, meta),
      anchors: await collectAnchors(markdown, markdownSteps, markdownSemantics),
      links: collectLinks(markdown),
    })
  }

  return pages
}

async function main() {
  if (!existsSync(CONTENT_DIR)) {
    throw new Error(`Content directory not found: ${CONTENT_DIR}`)
  }

  const markdownSemantics = await loadProjectTypeScriptModule(
    'app/utils/docs-markdown-semantics.ts',
  )
  const markdownSteps = await loadProjectTypeScriptModule(
    'app/utils/docs-markdown-steps.ts',
  )
  const docsLink = await loadProjectTypeScriptModule('app/utils/docs-link.ts', {
    '#shared/docs-identity.js': require('../shared/docs-identity.js'),
  })
  const files = await walkDocsFiles(CONTENT_DIR)
  const pages = await createDocsPages(files, markdownSteps, markdownSemantics)
  const metaFailures = await validateMetaDirectories(files)
  const identityIndex = createDocsIdentityIndex(pages)
  const indexes = {
    bySourcePath: new Map(
      identityIndex.entries.map(({ identity, record }) => [
        identity.sourcePath,
        record,
      ]),
    ),
    byRoutePath: new Map(
      identityIndex.entries.map(({ identity, record }) => [
        identity.routePath,
        record,
      ]),
    ),
  }
  const failures = []

  for (const page of pages) {
    for (const link of page.links) {
      validateLink(
        link,
        page,
        pages,
        indexes,
        failures,
        docsLink.resolveDocsLink,
      )
    }
  }

  if (metaFailures.length > 0 || failures.length > 0) {
    console.error('Docs link validation failed:')
    for (const failure of metaFailures) {
      console.error(`- ${failure}`)
    }
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
