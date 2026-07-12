<script setup lang="ts">
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { computed } from 'vue'
import { provideDocsLinkContext } from '~/composables/useDocsLink'
import docsMarkdownPipeline from '~/utils/docs-markdown-pipeline'
import { readDocsMarkdownSource } from '~/utils/docs-markdown'

const props = defineProps<{
  path: string
}>()

const markdown = await readDocsMarkdownSource(props.path)
const ast = await parseMarkdown(markdown, {
  rehype: {
    plugins: {
      docsMarkdownPipeline: {
        instance: docsMarkdownPipeline,
      },
    },
  },
})

provideDocsLinkContext({
  currentSourcePath: computed(() => props.path),
  pages: computed(() => []),
})

const content = computed(() => ({
  body: ast.body,
  ...ast.data,
}))
</script>

<template>
  <DocsBody>
    <ContentRenderer :value="content" />
  </DocsBody>
</template>
