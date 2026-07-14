import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import docsMarkdownSemantics from '../../../app/utils/docs-markdown-semantics'
import { normalizeDocsContentToc } from '../../../build/docs-content-toc-bridge'
import { normalizeDocsMetadataContent } from '../../../build/docs-metadata-ingestion'

function createLocalImportPath(url: URL) {
  return decodeURIComponent(url.pathname)
    .replace(/^\/([A-Za-z]:)/, '$1')
    .replace(/\\/g, '/')
}

const docsMetadataIngestionTransformerPath = createLocalImportPath(
  new URL('../../../build/docs-metadata-ingestion.ts', import.meta.url),
)
const docsMarkdownSemanticsPluginPath = createLocalImportPath(
  new URL('../../../app/utils/docs-markdown-semantics.ts', import.meta.url),
)
const docsMarkdownOptions = {
  configs: [docsMarkdownSemantics],
  remarkPlugins: {
    docsMarkdownSemantics: {
      instance: docsMarkdownSemantics,
      src: docsMarkdownSemanticsPluginPath,
    },
  },
}

function captureNativeAfterParse(context: {
  collection: { name: string }
  file: { id?: string; path?: string }
  content: Record<string, unknown>
}) {
  if (context.collection.name !== 'nativeDocs') {
    return
  }

  const snapshotRoot = process.env.NUXT_NATIVE_AFTER_PARSE

  if (!snapshotRoot) {
    throw new Error('NUXT_NATIVE_AFTER_PARSE is required')
  }

  mkdirSync(snapshotRoot, { recursive: true })
  const identity = context.file.id || context.file.path || 'unknown'
  const filename = identity.replace(/[^a-z0-9.-]+/gi, '_')

  writeFileSync(
    resolve(snapshotRoot, `${filename}.json`),
    JSON.stringify(context.content),
  )
}

export default defineNuxtConfig({
  buildDir: process.env.NUXT_BUILD_DIR,
  nitro: {
    output: {
      dir: process.env.NUXT_OUTPUT_DIR,
    },
  },
  modules: ['@nuxt/content'],
  hooks: {
    'content:file:afterParse': (context) => {
      captureNativeAfterParse(context)
      normalizeDocsContentToc(context)
      normalizeDocsMetadataContent(context)
    },
  },
  content: {
    build: {
      transformers: [docsMetadataIngestionTransformerPath],
      markdown: docsMarkdownOptions,
    },
    _localDatabase: process.env.NUXT_CONTENT_LOCAL_DATABASE
      ? {
          type: 'sqlite',
          filename: process.env.NUXT_CONTENT_LOCAL_DATABASE,
        }
      : undefined,
    database: process.env.NUXT_CONTENT_DATABASE
      ? {
          type: 'sqlite',
          filename: process.env.NUXT_CONTENT_DATABASE,
        }
      : undefined,
    experimental: {
      sqliteConnector: 'native',
    },
  },
  compatibilityDate: '2024-04-03',
})
