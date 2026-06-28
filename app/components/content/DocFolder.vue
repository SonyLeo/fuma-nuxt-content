<script setup lang="ts">
import { Folder, FolderOpen } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    name: string
    defaultOpen?: boolean
    disabled?: boolean
  }>(),
  {
    defaultOpen: false,
    disabled: false,
  },
)

function toggleLabel(open: boolean) {
  return `${open ? 'Collapse' : 'Expand'} ${props.name} folder`
}
</script>

<template>
  <DocCollapsible
    class="fd-doc-folder"
    :default-open="defaultOpen"
    :disabled="disabled"
  >
    <template #default="{ open, toggle, contentId }">
      <button
        class="fd-doc-folder-trigger"
        type="button"
        :aria-label="toggleLabel(open)"
        :aria-expanded="open"
        :aria-controls="contentId"
        :disabled="disabled"
        @click="toggle"
      >
        <FolderOpen v-if="open" class="fd-doc-file-icon" aria-hidden="true" />
        <Folder v-else class="fd-doc-file-icon" aria-hidden="true" />
        <span class="fd-doc-file-name" :title="name">{{ name }}</span>
      </button>

      <div v-show="open" :id="contentId" class="fd-doc-folder-content">
        <slot />
      </div>
    </template>
  </DocCollapsible>
</template>
