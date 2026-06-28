<script setup lang="ts">
import { useTemplateRef } from 'vue'

defineOptions({
  inheritAttrs: false,
})

defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function updateValue(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

const inputRef = useTemplateRef<HTMLInputElement>('input')

function focus() {
  inputRef.value?.focus()
}

defineExpose({
  focus,
})
</script>

<template>
  <input
    ref="input"
    v-bind="$attrs"
    class="ui-command-input"
    :value="modelValue"
    @input="updateValue"
  />
</template>
