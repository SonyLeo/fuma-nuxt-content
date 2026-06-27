<script setup lang="ts">
import type { DocsNode, DocsTocItem } from '~/types/docs'

defineProps<{
  title?: string
  headline?: string
  navigation?: DocsNode[]
  currentPath?: string
  toc?: DocsTocItem[]
}>()
</script>

<template>
  <div class="docs-shell">
    <DocsHeader :title="title" />

    <div class="docs-shell-body">
      <DocsSidebar
        :headline="headline"
        :items="navigation || []"
        :current-path="currentPath || '/'"
      />

      <main class="docs-shell-content">
        <slot />
      </main>

      <DocsToc :items="toc || []" />
    </div>
  </div>
</template>
