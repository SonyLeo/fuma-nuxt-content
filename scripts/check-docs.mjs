import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const root = process.cwd()
const designDir = join(root, 'design')

const activeDocs = new Map([
  ['roadmap.md', 200],
  ['foundation-status.md', 350],
  ['product-backlog.md', 300],
  ['component-inventory.md', 300],
  ['verification-runbook.md', 400],
  ['reka-migration.md', 300],
  ['decisions.md', 300],
])

const archiveDocs = new Map([
  ['implementation-2026-q3.md', 120],
  ['parity-cases.md', 120],
  ['verification-history.md', 120],
])

const activeLineBudget = 1200
const archiveLineBudget = 300

const requiredFrontmatter = ['status', 'type', 'owner', 'lastReviewed']
const bannedActiveReferences = [
  'development-workflow-audit.md',
  'foundation-alignment-matrix.md',
  'foundation-prep-plan.md',
  'foundation-roadmap.md',
  'fumadocs-alignment-plan.md',
  'fumadocs-component-parity-inventory.md',
  'fumadocs-gap-audit.md',
  'implementation-notes.md',
  'layout-provider-parity-plan.md',
  'nuxt-content-mvp-plan.md',
  'parity-reconstruction-workflow.md',
  'playwright-verification-plan.md',
  'product-roadmap.md',
  'reka-primitive-migration-plan.md',
  'sidebar-parity-plan.md',
  'theme-runtime-parity-plan.md',
  'scripts/dev-server.mjs',
  'scripts/run-playwright.mjs',
  'scripts/check-app.mjs',
  'tests/e2e/content-components.spec.ts',
  'app:check',
]

const errors = []

function walkMarkdown(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) {
      return walkMarkdown(path)
    }

    return entry.isFile() && entry.name.endsWith('.md') ? [path] : []
  })
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const values = new Map()

  if (!match) {
    return values
  }

  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':')

    if (separator > 0) {
      values.set(
        line.slice(0, separator).trim(),
        line.slice(separator + 1).trim(),
      )
    }
  }

  return values
}

function displayPath(path) {
  return relative(root, path).replaceAll('\\', '/')
}

function checkMarkdownLinks(path, content) {
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g

  for (const match of content.matchAll(linkPattern)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, '')

    if (
      !rawTarget ||
      rawTarget.startsWith('#') ||
      /^(?:https?:|mailto:|thread:)/i.test(rawTarget)
    ) {
      continue
    }

    const fileTarget = decodeURIComponent(rawTarget.split(/[?#]/, 1)[0])
    const resolvedTarget = resolve(dirname(path), fileTarget)

    if (!existsSync(resolvedTarget)) {
      errors.push(`${displayPath(path)} links to missing ${rawTarget}`)
    }
  }
}

const topLevelDocs = readdirSync(designDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
  .map((entry) => entry.name)

for (const name of topLevelDocs) {
  if (!activeDocs.has(name)) {
    errors.push(`design/${name} is not an approved active document`)
  }
}

for (const name of activeDocs.keys()) {
  if (!existsSync(join(designDir, name))) {
    errors.push(`design/${name} is missing`)
  }
}

const archiveDir = join(designDir, 'archive')
const archiveNames = readdirSync(archiveDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
  .map((entry) => entry.name)

for (const name of archiveNames) {
  if (!archiveDocs.has(name)) {
    errors.push(`design/archive/${name} is not an approved historical summary`)
  }
}

for (const name of archiveDocs.keys()) {
  if (!existsSync(join(archiveDir, name))) {
    errors.push(`design/archive/${name} is missing`)
  }
}

const designDocs = walkMarkdown(designDir)

for (const path of designDocs) {
  const content = readFileSync(path, 'utf8')
  const frontmatter = parseFrontmatter(content)
  const relativeToDesign = relative(designDir, path).replaceAll('\\', '/')
  const isArchive = relativeToDesign.startsWith('archive/')

  for (const key of requiredFrontmatter) {
    if (!frontmatter.get(key)) {
      errors.push(`${displayPath(path)} is missing frontmatter field ${key}`)
    }
  }

  const expectedStatus = isArchive ? 'historical' : 'active'
  if (frontmatter.get('status') !== expectedStatus) {
    errors.push(
      `${displayPath(path)} must use status: ${expectedStatus}, found ${frontmatter.get('status') || 'missing'}`,
    )
  }

  if (!isArchive) {
    const limit = activeDocs.get(relativeToDesign)
    const lineCount = content.split(/\r?\n/).length

    if (limit && lineCount > limit) {
      errors.push(
        `${displayPath(path)} has ${lineCount} lines; limit is ${limit}`,
      )
    }

    for (const reference of bannedActiveReferences) {
      if (
        relativeToDesign === 'verification-runbook.md' &&
        [
          'scripts/dev-server.mjs',
          'scripts/run-playwright.mjs',
          'scripts/check-app.mjs',
          'app:check',
        ].includes(reference)
      ) {
        continue
      }

      if (content.includes(reference)) {
        errors.push(
          `${displayPath(path)} contains retired reference ${reference}`,
        )
      }
    }
  } else {
    const archiveName = relativeToDesign.replace(/^archive\//, '')
    const limit = archiveDocs.get(archiveName)
    const lineCount = content.split(/\r?\n/).length

    if (limit && lineCount > limit) {
      errors.push(
        `${displayPath(path)} has ${lineCount} lines; limit is ${limit}`,
      )
    }
  }

  checkMarkdownLinks(path, content)
}

for (const rootDoc of ['README.md', 'AGENTS.md']) {
  const path = join(root, rootDoc)
  const content = readFileSync(path, 'utf8')

  for (const reference of bannedActiveReferences) {
    if (content.includes(reference)) {
      errors.push(`${rootDoc} contains retired reference ${reference}`)
    }
  }

  checkMarkdownLinks(path, content)
}

if (errors.length > 0) {
  console.error('Documentation governance validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

const activeLines = [...activeDocs.keys()].reduce((total, name) => {
  const content = readFileSync(join(designDir, name), 'utf8')
  return total + content.split(/\r?\n/).length
}, 0)

const archiveLines = [...archiveDocs.keys()].reduce((total, name) => {
  const content = readFileSync(join(archiveDir, name), 'utf8')
  return total + content.split(/\r?\n/).length
}, 0)

if (activeLines > activeLineBudget) {
  errors.push(
    `active documentation has ${activeLines} lines; budget is ${activeLineBudget}`,
  )
}

if (archiveLines > archiveLineBudget) {
  errors.push(
    `archive documentation has ${archiveLines} lines; budget is ${archiveLineBudget}`,
  )
}

const roadmap = readFileSync(join(designDir, 'roadmap.md'), 'utf8')
for (const name of activeDocs.keys()) {
  if (name !== 'roadmap.md' && !roadmap.includes(`./${name}`)) {
    errors.push(`design/roadmap.md does not link to active document ${name}`)
  }
}

if (errors.length > 0) {
  console.error('Documentation governance validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log(
  `Documentation governance passed: ${activeDocs.size} active docs (${activeLines}/${activeLineBudget} lines), ${archiveDocs.size} archive docs (${archiveLines}/${archiveLineBudget} lines).`,
)
