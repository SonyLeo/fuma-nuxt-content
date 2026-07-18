import tailwindcss from '@tailwindcss/vite'
import docsMarkdownCodeTabs from './app/utils/docs-markdown-code-tabs'
import docsMarkdownPackageManager from './app/utils/docs-markdown-package-manager'
import docsMarkdownPipeline from './app/utils/docs-markdown-pipeline'
import docsMarkdownSemantics from './app/utils/docs-markdown-semantics'
import docsMarkdownSteps from './app/utils/docs-markdown-steps'
import { normalizeDocsContentToc } from './build/docs-content-toc-bridge'
import { normalizeDocsMetadataContent } from './build/docs-metadata-ingestion'

function createLocalImportPath(url: URL) {
  return decodeURIComponent(url.pathname)
    .replace(/^\/([A-Za-z]:)/, '$1')
    .replace(/\\/g, '/')
}

const docsMarkdownPipelinePluginPath = createLocalImportPath(
  new URL('./app/utils/docs-markdown-pipeline.ts', import.meta.url),
)
const docsMarkdownCodeTabsPluginPath = createLocalImportPath(
  new URL('./app/utils/docs-markdown-code-tabs.ts', import.meta.url),
)
const docsMarkdownPackageManagerPluginPath = createLocalImportPath(
  new URL('./app/utils/docs-markdown-package-manager.ts', import.meta.url),
)
const docsMarkdownSemanticsPluginPath = createLocalImportPath(
  new URL('./app/utils/docs-markdown-semantics.ts', import.meta.url),
)
const docsMarkdownStepsPluginPath = createLocalImportPath(
  new URL('./app/utils/docs-markdown-steps.ts', import.meta.url),
)
const docsMetadataIngestionTransformerPath = createLocalImportPath(
  new URL('./build/docs-metadata-ingestion.ts', import.meta.url),
)
const docsMarkdownOptions = {
  configs: [docsMarkdownSemantics],
  remarkPlugins: {
    docsMarkdownSteps: {
      instance: docsMarkdownSteps,
      src: docsMarkdownStepsPluginPath,
    },
    docsMarkdownCodeTabs: {
      instance: docsMarkdownCodeTabs,
      src: docsMarkdownCodeTabsPluginPath,
    },
    docsMarkdownPackageManager: {
      instance: docsMarkdownPackageManager,
      src: docsMarkdownPackageManagerPluginPath,
    },
    docsMarkdownSemantics: {
      instance: docsMarkdownSemantics,
      src: docsMarkdownSemanticsPluginPath,
    },
  },
  rehypePlugins: {
    docsMarkdownPipeline: {
      instance: docsMarkdownPipeline,
      src: docsMarkdownPipelinePluginPath,
    },
  },
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  buildDir: process.env.NUXT_BUILD_DIR ?? '.nuxt',
  modules: ['@nuxt/eslint', '@nuxt/content', '@nuxt/test-utils/module'],
  hooks: {
    'content:file:afterParse': (context) => {
      normalizeDocsContentToc(context)
      normalizeDocsMetadataContent(context)
    },
    'mdc:configSources'(configs) {
      if (!configs.includes(docsMarkdownSemanticsPluginPath)) {
        configs.push(docsMarkdownSemanticsPluginPath)
      }
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  content: {
    build: {
      transformers: [docsMetadataIngestionTransformerPath],
      markdown: docsMarkdownOptions,
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
