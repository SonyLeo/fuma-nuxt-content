<script setup lang="ts">
import { ChevronDown, List } from '@lucide/vue'
import type { DocsTocItem } from '~/types/docs'

const props = withDefaults(
  defineProps<{
    items?: DocsTocItem[]
    title?: string
    defaultOpen?: boolean
  }>(),
  {
    items: undefined,
    title: 'Table of Contents',
    defaultOpen: true,
  },
)

const resolvedItems = useDocsInlineToc(computed(() => props.items))
const { activeId } = useDocsTocState(resolvedItems)

function itemStyle(item: DocsTocItem) {
  return {
    paddingInlineStart: `${Math.max(item.depth - 2, 0) * 0.75}rem`,
  }
}
</script>

<template>
  <DocCollapsible
    v-if="resolvedItems.length > 0"
    class="fd-doc-inline-toc"
    :default-open="defaultOpen"
  >
    <template #default="{ open, toggle, contentId }">
      <button
        class="fd-doc-inline-toc-trigger"
        type="button"
        :aria-label="open ? `Collapse ${title}` : `Expand ${title}`"
        :aria-expanded="open"
        :aria-controls="contentId"
        @click="toggle"
      >
        <span class="fd-doc-inline-toc-title">
          <List class="fd-doc-inline-toc-icon" aria-hidden="true" />
          <slot name="title">{{ title }}</slot>
        </span>
        <ChevronDown class="fd-doc-inline-toc-chevron" aria-hidden="true" />
      </button>

      <nav v-show="open" :id="contentId" class="fd-doc-inline-toc-content">
        <a
          v-for="item in resolvedItems"
          :key="item.id"
          class="fd-doc-inline-toc-link"
          :class="{ 'is-active': activeId === item.id }"
          :href="`#${item.id}`"
          :style="itemStyle(item)"
        >
          {{ item.text }}
        </a>
      </nav>
    </template>
  </DocCollapsible>
</template>
