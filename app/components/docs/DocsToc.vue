<script setup lang="ts">
defineProps<{
  items: Array<{
    id: string
    text: string
    depth: number
  }>
}>()
</script>

<template>
  <aside v-if="items.length > 0" class="docs-toc">
    <div class="docs-toc-inner">
      <p class="docs-toc-label">On this page</p>

      <nav aria-label="Table of contents">
        <ul class="docs-toc-list">
          <li
            v-for="item in items"
            :key="item.id"
            class="docs-toc-item"
            :class="{ 'is-nested': item.depth === 3 }"
          >
            <a class="docs-toc-link" :href="`#${item.id}`">
              {{ item.text }}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>
