import tailwindcss from '@tailwindcss/vite'
import docsMarkdownPipeline from './app/utils/docs-markdown-pipeline'
import { normalizeDocsMetadataContent } from './build/docs-metadata-ingestion'

function createLocalImportPath(url: URL) {
  return decodeURIComponent(url.pathname)
    .replace(/^\/([A-Za-z]:)/, '$1')
    .replace(/\\/g, '/')
}

const docsMarkdownPipelinePluginPath = createLocalImportPath(
  new URL('./app/utils/docs-markdown-pipeline.ts', import.meta.url),
)
const docsMetadataIngestionTransformerPath = createLocalImportPath(
  new URL('./build/docs-metadata-ingestion.ts', import.meta.url),
)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  buildDir: process.env.NUXT_BUILD_DIR ?? '.nuxt',
  modules: ['@nuxt/eslint', '@nuxt/content', '@nuxt/test-utils/module'],
  hooks: {
    'content:file:afterParse': normalizeDocsMetadataContent,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  content: {
    build: {
      transformers: [docsMetadataIngestionTransformerPath],
      markdown: {
        rehypePlugins: {
          docsMarkdownPipeline: {
            instance: docsMarkdownPipeline,
            src: docsMarkdownPipelinePluginPath,
          },
        },
      },
    },
    experimental: {
      sqliteConnector: 'native',
    },
  },
  mdc: {
    highlight: {
      theme: {
        default: 'catppuccin-latte',
        dark: 'catppuccin-mocha',
      },
    },
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
})
