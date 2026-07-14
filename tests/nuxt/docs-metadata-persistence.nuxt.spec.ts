// @vitest-environment node

import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { afterAll, beforeAll, expect, test } from 'vitest'
import { docsCanonicalTocKey } from '../../app/utils/docs-markdown-semantics'

const execFileAsync = promisify(execFile)
const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))
const fixtureSourceRoot = resolve(
  repositoryRoot,
  'tests/fixtures/docs-metadata-ingestion',
)
const testsRoot = resolve(repositoryRoot, 'tests')
const ownedRoot = mkdtempSync(resolve(testsRoot, 'docs-metadata-'))
const fixtureRoot = resolve(ownedRoot, 'tests/fixtures/docs-metadata-ingestion')
const buildDir = resolve(ownedRoot, 'build')
const outputDir = resolve(ownedRoot, 'output')
const localDatabase = resolve(ownedRoot, 'database/local.sqlite')
const runtimeDatabase = resolve(ownedRoot, 'database/runtime.sqlite')
const nativeAfterParseRoot = resolve(ownedRoot, 'native-after-parse')
const repositoryDatabase = resolve(
  repositoryRoot,
  '.data/content/contents.sqlite',
)
const nuxtCli = resolve(repositoryRoot, 'node_modules/nuxt/bin/nuxt.mjs')
const fixtureArtifactPaths = ['.data', '.nuxt', '.output', 'node_modules'].map(
  (entry) => resolve(fixtureSourceRoot, entry),
)

function fingerprintFile(path: string) {
  if (!existsSync(path)) {
    return { exists: false as const }
  }

  const content = readFileSync(path)
  const stat = statSync(path)

  return {
    exists: true as const,
    size: stat.size,
    mtimeMs: stat.mtimeMs,
    sha256: createHash('sha256').update(content).digest('hex'),
  }
}

const repositoryDatabaseBefore = fingerprintFile(repositoryDatabase)

cpSync(fixtureSourceRoot, fixtureRoot, { recursive: true })
mkdirSync(resolve(ownedRoot, 'build'), { recursive: true })
mkdirSync(resolve(ownedRoot, 'shared'), { recursive: true })
mkdirSync(resolve(ownedRoot, 'app/utils'), { recursive: true })
cpSync(
  resolve(repositoryRoot, 'app/utils/docs-markdown-semantics.ts'),
  resolve(ownedRoot, 'app/utils/docs-markdown-semantics.ts'),
)
cpSync(
  resolve(repositoryRoot, 'build/docs-content-toc-bridge.ts'),
  resolve(ownedRoot, 'build/docs-content-toc-bridge.ts'),
)
cpSync(
  resolve(repositoryRoot, 'build/docs-metadata-ingestion.ts'),
  resolve(ownedRoot, 'build/docs-metadata-ingestion.ts'),
)
cpSync(
  resolve(repositoryRoot, 'shared/docs-metadata.ts'),
  resolve(ownedRoot, 'shared/docs-metadata.ts'),
)
mkdirSync(buildDir, { recursive: true })
mkdirSync(dirname(localDatabase), { recursive: true })

function isWithin(parent: string, candidate: string) {
  const path = relative(parent, candidate)
  return path !== '' && !path.startsWith('..') && !isAbsolute(path)
}

beforeAll(async () => {
  await execFileAsync(
    process.execPath,
    [nuxtCli, 'build', fixtureRoot, '--logLevel', 'silent'],
    {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        NUXT_BUILD_DIR: buildDir,
        NUXT_OUTPUT_DIR: outputDir,
        NUXT_CONTENT_LOCAL_DATABASE: localDatabase,
        NUXT_CONTENT_DATABASE: runtimeDatabase,
        NUXT_NATIVE_AFTER_PARSE: nativeAfterParseRoot,
      },
      windowsHide: true,
    },
  )
}, 180_000)

function removeTestOwnedRoot(path: string) {
  if (
    !isWithin(testsRoot, path) ||
    !path.startsWith(resolve(testsRoot, 'docs-metadata-'))
  ) {
    throw new Error(`Refusing to remove non-test-owned path: ${path}`)
  }

  rmSync(path, { recursive: true, force: true })
}

afterAll(() => {
  try {
    expect(fingerprintFile(repositoryDatabase)).toEqual(
      repositoryDatabaseBefore,
    )

    for (const path of fixtureArtifactPaths) {
      expect(existsSync(path), `Unexpected fixture artifact: ${path}`).toBe(
        false,
      )
    }
  } finally {
    removeTestOwnedRoot(ownedRoot)
  }
})

test('persists normalized page and directory metadata in an isolated database', () => {
  expect(isWithin(ownedRoot, buildDir)).toBe(true)
  expect(isWithin(ownedRoot, outputDir)).toBe(true)
  expect(isWithin(ownedRoot, localDatabase)).toBe(true)
  expect(isWithin(ownedRoot, runtimeDatabase)).toBe(true)
  expect(localDatabase).not.toBe(repositoryDatabase)
  expect(runtimeDatabase).not.toBe(repositoryDatabase)
  expect(existsSync(localDatabase)).toBe(true)
  expect(statSync(localDatabase).size).toBeGreaterThan(0)
  expect(statSync(buildDir).isDirectory()).toBe(true)
  expect(statSync(outputDir).isDirectory()).toBe(true)
  expect(existsSync(runtimeDatabase)).toBe(false)

  const database = new DatabaseSync(localDatabase, { readOnly: true })

  try {
    const explicitFalse = database
      .prepare('SELECT docsMetadata FROM _content_docs WHERE stem = ?')
      .get('docs/explicit-false') as { docsMetadata: string }
    const missingBoolean = database
      .prepare('SELECT docsMetadata FROM _content_docs WHERE stem = ?')
      .get('docs/missing-boolean') as { docsMetadata: string }
    const explicitFalseDirectory = database
      .prepare('SELECT docsMetadata FROM _content_docsMeta WHERE stem = ?')
      .get('guide/meta') as { docsMetadata: string }
    const missingDirectoryBoolean = database
      .prepare('SELECT docsMetadata FROM _content_docsMeta WHERE stem = ?')
      .get('reference/meta') as { docsMetadata: string }

    const explicitFalseMetadata = JSON.parse(explicitFalse.docsMetadata)
    const missingMetadata = JSON.parse(missingBoolean.docsMetadata)
    const explicitFalseDirectoryMetadata = JSON.parse(
      explicitFalseDirectory.docsMetadata,
    )
    const missingDirectoryMetadata = JSON.parse(
      missingDirectoryBoolean.docsMetadata,
    )

    expect(explicitFalseMetadata.title).toBe('Explicit false page')
    expect(explicitFalseMetadata.toc).toBe(false)
    expect(Object.hasOwn(explicitFalseMetadata, 'toc')).toBe(true)
    expect(missingMetadata.title).toBe('Missing Boolean page')
    expect(Object.hasOwn(missingMetadata, 'toc')).toBe(false)

    expect(explicitFalseDirectoryMetadata).toEqual({
      stem: 'guide',
      title: 'Guide directory',
      hidden: false,
    })
    expect(Object.hasOwn(explicitFalseDirectoryMetadata, 'hidden')).toBe(true)
    expect(missingDirectoryMetadata).toEqual({
      stem: 'reference',
      title: 'Reference directory',
    })
    expect(Object.hasOwn(missingDirectoryMetadata, 'hidden')).toBe(false)

    const docsRows = database
      .prepare('SELECT body, meta FROM _content_docs')
      .all() as Array<{ body: string; meta: string }>

    expect(docsRows.length).toBeGreaterThan(0)

    for (const row of docsRows) {
      expect(row.body).not.toContain(docsCanonicalTocKey)
      expect(row.meta).not.toContain(docsCanonicalTocKey)
    }
  } finally {
    database.close()
  }
})

test('records native metadata before SQL Boolean conversion', () => {
  const explicitSnapshot = JSON.parse(
    readFileSync(
      resolve(nativeAfterParseRoot, 'nativeDocs_native_explicit.md.json'),
      'utf8',
    ),
  ) as Record<string, unknown>
  const missingSnapshot = JSON.parse(
    readFileSync(
      resolve(nativeAfterParseRoot, 'nativeDocs_native_missing.md.json'),
      'utf8',
    ),
  ) as Record<string, unknown>

  expect(explicitSnapshot.title).toBe('Native explicit title')
  expect(explicitSnapshot.toc).toBe(false)
  expect(explicitSnapshot.full).toBe(false)
  expect(Object.hasOwn(explicitSnapshot, 'toc')).toBe(true)
  expect(Object.hasOwn(explicitSnapshot, 'full')).toBe(true)
  expect(missingSnapshot.title).toBe('Native missing Boolean title')
  expect(Object.hasOwn(missingSnapshot, 'toc')).toBe(false)
  expect(Object.hasOwn(missingSnapshot, 'full')).toBe(false)
  const missingTitleSnapshot = JSON.parse(
    readFileSync(
      resolve(nativeAfterParseRoot, 'nativeDocs_native_no-title.md.json'),
      'utf8',
    ),
  ) as Record<string, unknown>

  expect(missingTitleSnapshot.title).toBe('Native generated title')
  const wrongTypeSnapshot = JSON.parse(
    readFileSync(
      resolve(nativeAfterParseRoot, 'nativeDocs_native_wrong-type.md.json'),
      'utf8',
    ),
  ) as Record<string, unknown>

  expect(wrongTypeSnapshot.title).toBe('Native wrong type')
  expect(wrongTypeSnapshot.toc).toBe('nope')

  const database = new DatabaseSync(localDatabase, { readOnly: true })

  try {
    const explicit = database
      .prepare(
        'SELECT title, toc, full FROM _content_nativeDocs WHERE stem = ?',
      )
      .get('native/explicit') as {
      title: string
      toc: number
      full: number
    }
    const missing = database
      .prepare(
        'SELECT title, toc, full FROM _content_nativeDocs WHERE stem = ?',
      )
      .get('native/missing') as {
      title: string
      toc: null
      full: null
    }
    const missingTitle = database
      .prepare(
        'SELECT title, toc, full FROM _content_nativeDocs WHERE stem = ?',
      )
      .get('native/no-title') as {
      title: string
      toc: null
      full: null
    }
    const wrongType = database
      .prepare(
        'SELECT title, toc, full FROM _content_nativeDocs WHERE stem = ?',
      )
      .get('native/wrong-type') as {
      title: string
      toc: number
      full: null
    }

    expect(explicit).toEqual({
      title: 'Native explicit title',
      toc: 0,
      full: 0,
    })
    expect(missing).toEqual({
      title: 'Native missing Boolean title',
      toc: null,
      full: null,
    })
    expect(missingTitle).toEqual({
      title: 'Native generated title',
      toc: null,
      full: null,
    })
    expect(wrongType).toEqual({
      title: 'Native wrong type',
      toc: 1,
      full: null,
    })
  } finally {
    database.close()
  }

  expect(existsSync(localDatabase)).toBe(true)
  expect(statSync(localDatabase).size).toBeGreaterThan(0)
})

test('does not mutate repository database or source fixture', () => {
  expect(fingerprintFile(repositoryDatabase)).toEqual(repositoryDatabaseBefore)

  for (const path of fixtureArtifactPaths) {
    expect(existsSync(path), `Unexpected fixture artifact: ${path}`).toBe(false)
  }
})

test('cleanup runs from a finally block after an ordinary failure', () => {
  const cleanupRoot = mkdtempSync(resolve(testsRoot, 'docs-metadata-cleanup-'))
  let failure: Error | undefined

  try {
    throw new Error('ordinary test failure')
  } catch (error) {
    failure = error as Error
  } finally {
    removeTestOwnedRoot(cleanupRoot)
  }

  expect(failure?.message).toBe('ordinary test failure')
  expect(existsSync(cleanupRoot)).toBe(false)
})
