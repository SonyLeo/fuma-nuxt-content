import tailwindcss from '@tailwindcss/vite'
import docsMarkdownPipeline from './app/utils/docs-markdown-pipeline'

function createLocalImportPath(url: URL) {
  return decodeURIComponent(url.pathname)
    .replace(/^\/([A-Za-z]:)/, '$1')
    .replace(/\\/g, '/')
}

const docsMarkdownPipelinePluginPath = createLocalImportPath(
  new URL('./app/utils/docs-markdown-pipeline.ts', import.meta.url),
)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  buildDir: '.nuxt',
  modules: ['@nuxt/eslint', '@nuxt/content'],
  vite: {
    plugins: [tailwindcss()],
  },
  content: {
    build: {
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
