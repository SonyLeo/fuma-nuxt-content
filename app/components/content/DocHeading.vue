<script setup lang="ts">
import { Check, Link2 } from '@lucide/vue'
import { writeDocsClipboardText } from '~/utils/docs-clipboard'

const props = withDefaults(
  defineProps<{
    as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    id?: string
  }>(),
  {
    id: undefined,
  },
)

async function copyHeadingLink() {
  if (!props.id || !import.meta.client) {
    return
  }

  const url = new URL(window.location.href)
  url.hash = props.id

  await writeDocsClipboardText(url.href)
}
</script>

<template>
  <component :is="props.as" :id="props.id" class="docs-heading">
    <a
      v-if="props.id"
      class="docs-heading-anchor"
      :href="`#${props.id}`"
      data-card=""
    >
      <slot />
    </a>
    <slot v-else />
    <DocsCopyButton
      v-if="props.id"
      class="docs-heading-copy"
      size="icon-xs"
      label="Copy Anchor Link"
      copied-label="Copied Anchor Link"
      failed-label="Copy Anchor Link Failed"
      :copy="copyHeadingLink"
      data-heading-copy=""
    >
      <template #default="{ state }">
        <Check v-if="state === 'copied'" :size="14" aria-hidden="true" />
        <Link2 v-else :size="14" aria-hidden="true" />
      </template>
    </DocsCopyButton>
  </component>
</template>
