<script setup lang="ts">
import type { Component } from 'vue'
import { File } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    name: string
    icon?: Component
  }>(),
  {
    icon: undefined,
  },
)

const rowIcon = computed(() => props.icon ?? File)
</script>

<template>
  <div class="fd-doc-file">
    <component :is="rowIcon" class="fd-doc-file-icon" aria-hidden="true" />
    <span class="fd-doc-file-name" :title="name">{{ name }}</span>
  </div>
</template>
