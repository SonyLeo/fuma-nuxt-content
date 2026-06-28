<script setup lang="ts">
type DocCodeTab = {
  label: string
  code: string
  language?: string
  filename?: string
}

const props = withDefaults(
  defineProps<{
    tabs: DocCodeTab[]
    label?: string
    defaultValue?: string
  }>(),
  {
    label: undefined,
    defaultValue: undefined,
  },
)

const validTabs = computed(() =>
  props.tabs.filter((tab) => tab.label.trim() && tab.code.trim()),
)
const defaultTab = computed(
  () => props.defaultValue ?? validTabs.value[0]?.label ?? '',
)
</script>

<template>
  <DocTabs v-if="validTabs.length > 0" :default-value="defaultTab">
    <template #triggers>
      <span v-if="label" class="fd-doc-code-tabs-label">{{ label }}</span>
      <DocTab
        v-for="tab in validTabs"
        :key="tab.label"
        :value="tab.label"
        :label="tab.label"
        trigger
      />
    </template>

    <DocTab
      v-for="tab in validTabs"
      :key="tab.label"
      :value="tab.label"
      :label="tab.label"
    >
      <DocCodeBlock
        :code="tab.code"
        :language="tab.language"
        :filename="tab.filename"
      />
    </DocTab>
  </DocTabs>
</template>
