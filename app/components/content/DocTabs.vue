<script setup lang="ts">
import { computed, provide, shallowRef, useId } from 'vue'
import {
  docTabsIdKey,
  docTabsSetterKey,
  docTabsValueKey,
} from '~/utils/doc-tabs'

const props = defineProps<{
  defaultValue: string
}>()

const activeValue = shallowRef(props.defaultValue)
const tabsId = `fd-doc-tabs-${useId()}`

provide(
  docTabsValueKey,
  computed(() => activeValue.value),
)
provide(docTabsSetterKey, (value: string) => {
  activeValue.value = value
})
provide(docTabsIdKey, tabsId)
</script>

<template>
  <div class="fd-doc-tabs">
    <div class="fd-doc-tabs-list" role="tablist">
      <slot name="triggers" />
    </div>
    <div class="fd-doc-tabs-panels">
      <slot />
    </div>
  </div>
</template>
