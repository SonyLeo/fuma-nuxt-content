<script setup lang="ts">
type DocCodeTab = {
  label: string
  code: string
  language?: string
  filename?: string
}

const props = withDefaults(
  defineProps<{
    tabs: DocCodeTab[] | string
    label?: string
    defaultValue?: string
  }>(),
  {
    label: undefined,
    defaultValue: undefined,
  },
)

const resolvedTabs = computed<DocCodeTab[]>(() => {
  if (Array.isArray(props.tabs)) {
    return props.tabs
  }

  try {
    const parsed = JSON.parse(
      props.tabs.replaceAll('&quot;', '"').replaceAll('&apos;', "'"),
    )
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})
const validTabs = computed(() =>
  resolvedTabs.value.filter((tab) => tab.label.trim() && tab.code.trim()),
)
const defaultTab = computed(
  () => props.defaultValue ?? validTabs.value[0]?.label ?? '',
)
</script>

<template>
  <DocTabs
    v-if="validTabs.length > 0"
    class="fd-doc-code-tabs"
    :default-value="defaultTab"
  >
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
