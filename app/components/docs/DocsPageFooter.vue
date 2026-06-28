<script setup lang="ts">
import type { DocsPageFooterProps } from '~/types/docs'

withDefaults(defineProps<DocsPageFooterProps>(), {
  enabled: true,
})
</script>

<template>
  <footer
    v-if="enabled && (previous || next || $slots.default)"
    class="docs-page-footer"
  >
    <DocsPager
      v-if="previous || next"
      :previous="previous"
      :next="next"
      :labels="pagerLabels"
    />
    <slot />
  </footer>
</template>
