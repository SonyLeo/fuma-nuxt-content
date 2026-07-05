<script setup lang="ts">
import { TabsList } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <TabsList as-child>
    <div v-bind="$attrs" class="ui-tabs-list" role="tablist">
      <slot />
    </div>
  </TabsList>
</template>
