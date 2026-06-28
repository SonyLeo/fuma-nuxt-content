<script setup lang="ts">
import type { UiButtonSize, UiButtonVariant } from '~/components/ui/UiButton.vue'

const props = withDefaults(
  defineProps<{
    copy: () => void | Promise<void>
    label?: string
    copiedLabel?: string
    failedLabel?: string
    variant?: UiButtonVariant
    size?: UiButtonSize
  }>(),
  {
    label: 'Copy',
    copiedLabel: 'Copied',
    failedLabel: 'Copy failed',
    variant: 'ghost',
    size: 'icon-sm',
  },
)

const { state, copy: runCopy } = useCopyState()

const ariaLabel = computed(() => {
  if (state.value === 'copied') {
    return props.copiedLabel
  }

  if (state.value === 'failed') {
    return props.failedLabel
  }

  return props.label
})

async function copy() {
  await runCopy(props.copy)
}
</script>

<template>
  <UiButton
    :variant="variant"
    :size="size"
    :aria-label="ariaLabel"
    :loading="state === 'loading'"
    @click="copy"
  >
    <slot :state="state" />
  </UiButton>
</template>
