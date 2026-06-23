<script setup lang="ts">
defineProps<{
  title?: string
  headline?: string
  navigation?: any[]
  currentPath?: string
  toc?: Array<{
    id: string
    text: string
    depth: number
  }>
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
