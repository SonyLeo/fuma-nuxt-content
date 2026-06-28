<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

export type UiButtonVariant = 'primary' | 'outline' | 'ghost' | 'secondary'
export type UiButtonSize = 'sm' | 'icon' | 'icon-sm' | 'icon-xs'

const props = withDefaults(
  defineProps<{
    variant?: UiButtonVariant
    color?: UiButtonVariant
    size?: UiButtonSize
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    pressed?: boolean
  }>(),
  {
    variant: 'ghost',
    color: undefined,
    size: 'sm',
    type: 'button',
    disabled: false,
    loading: false,
  },
)

const resolvedVariant = computed(() => props.color ?? props.variant)
const isDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <button
    v-bind="$attrs"
    :type="type"
    class="ui-button"
    :disabled="isDisabled"
    :aria-pressed="pressed"
    :data-variant="resolvedVariant"
    :data-size="size"
    :data-disabled="isDisabled ? 'true' : undefined"
    :data-loading="loading ? 'true' : undefined"
    :data-pressed="pressed ? 'true' : undefined"
  >
    <slot />
  </button>
</template>
