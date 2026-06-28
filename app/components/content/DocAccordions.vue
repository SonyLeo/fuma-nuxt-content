<script setup lang="ts">
import { computed } from 'vue'
import {
  normalizeAccordionType,
  readBooleanLike,
  type DocAccordionType,
} from '~/utils/doc-accordion'

const props = withDefaults(
  defineProps<{
    type?: DocAccordionType
    defaultValue?: string | string[]
    collapsible?: boolean | 'true' | 'false'
  }>(),
  {
    type: 'multiple',
    defaultValue: undefined,
    collapsible: true,
  },
)

const accordionType = computed(() => normalizeAccordionType(props.type))
const canCollapse = computed(() => readBooleanLike(props.collapsible, true))
</script>

<template>
  <UiAccordion
    class="fd-doc-accordions"
    :type="accordionType"
    :default-value="defaultValue"
    :collapsible="canCollapse"
    :data-type="accordionType"
  >
    <slot />
  </UiAccordion>
</template>
