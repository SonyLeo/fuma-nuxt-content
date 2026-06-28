<script setup lang="ts">
import {
  Blocks,
  Box,
  BookOpen,
  Grid2X2,
  Library,
  LayoutPanelLeft,
  Palette,
  PenLine,
  Terminal,
} from '@lucide/vue'

const props = defineProps<{
  name?: string
}>()

const lucideIcons = {
  framework: Grid2X2,
  layout: LayoutPanelLeft,
  ui: LayoutPanelLeft,
  cube: Box,
  core: Box,
  mdx: PenLine,
  pen: PenLine,
  cli: Terminal,
  terminal: Terminal,
  components: Blocks,
  book: BookOpen,
  overview: BookOpen,
  library: Library,
  palette: Palette,
  theme: Palette,
} as const

const iconComponent = computed(() => {
  if (!props.name) {
    return undefined
  }

  return lucideIcons[props.name as keyof typeof lucideIcons]
})
</script>

<template>
  <svg
    v-if="name === 'github'"
    class="docs-nav-icon"
    :data-icon="name"
    role="img"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.3-.535-1.53.117-3.16 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.399 3-.399s2.04.132 3 .399c2.292-1.552 3.3-1.23 3.3-1.23.653 1.63.24 2.86.118 3.16.768.84 1.233 1.91 1.233 3.22 0 4.61-2.804 5.62-5.476 5.92.43.37.824 1.102.824 2.22 0 1.602-.015 2.894-.015 3.286 0 .319.216.694.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
    />
  </svg>
  <component
    :is="iconComponent"
    v-else-if="iconComponent"
    class="docs-nav-icon"
    :data-icon="name"
    aria-hidden="true"
  />
  <span
    v-else
    class="docs-nav-icon-fallback"
    :data-icon="name"
    aria-hidden="true"
  >
    {{ name?.slice(0, 1).toUpperCase() }}
  </span>
</template>
