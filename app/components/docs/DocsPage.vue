<script setup lang="ts">
import type { DocsPageProps, DocsTocItem } from '~/types/docs'

const props = withDefaults(defineProps<DocsPageProps>(), {
  full: false,
  header: undefined,
  toc: undefined,
  breadcrumb: undefined,
  footer: undefined,
})

defineSlots<{
  header(props: { header: DocsPageProps['header'] }): unknown
  pageActions(props: { header: DocsPageProps['header'] }): unknown
  breadcrumb(props: { breadcrumb: DocsPageProps['breadcrumb'] }): unknown
  default(): unknown
  body(): unknown
  footer(props: { footer: DocsPageProps['footer'] }): unknown
  toc(props: {
    toc: NonNullable<DocsPageProps['toc']>
    activeId?: string
    activeItem?: DocsTocItem
    progress: number
  }): unknown
  tocPopover(props: {
    toc: NonNullable<DocsPageProps['toc']>
    activeId?: string
    activeItem?: DocsTocItem
    progress: number
  }): unknown
}>()

const tocItems = computed(() => props.toc?.items ?? [])
provideDocsInlineToc(tocItems)
const tocEnabled = computed(() => {
  return (props.toc?.enabled ?? true) && tocItems.value.length > 0
})
const tocPopoverEnabled = computed(() => {
  return (props.toc?.popover ?? tocEnabled.value) && tocItems.value.length > 0
})
const tocOptions = computed(() => {
  return {
    items: tocItems.value,
    enabled: tocEnabled.value,
    popover: tocPopoverEnabled.value,
    label: props.toc?.label ?? 'On this page',
    activeLabel: props.toc?.activeLabel ?? 'On this page',
  }
})
const breadcrumbItems = computed(() => props.breadcrumb?.items ?? [])
const breadcrumbEnabled = computed(() => {
  return (props.breadcrumb?.enabled ?? true) && breadcrumbItems.value.length > 0
})
const { activeId, activeItem, progress } = useDocsTocState(
  computed(() =>
    tocEnabled.value || tocPopoverEnabled.value ? tocItems.value : [],
  ),
)
</script>

<template>
  <div
    class="docs-page-frame"
    :class="{
      'has-toc': tocEnabled,
      'has-toc-popover': tocPopoverEnabled,
    }"
  >
    <slot
      v-if="tocPopoverEnabled"
      name="tocPopover"
      :toc="tocOptions"
      :active-id="activeId"
      :active-item="activeItem"
      :progress="progress"
    >
      <DocsTocPopover
        :items="tocOptions.items"
        :active-id="activeId"
        :active-item="activeItem"
        :progress="progress"
        :active-label="tocOptions.activeLabel"
      />
    </slot>

    <article class="docs-page" :class="{ 'is-full': full }">
      <slot v-if="breadcrumbEnabled" name="breadcrumb" :breadcrumb="breadcrumb">
        <DocsBreadcrumb :items="breadcrumbItems" />
      </slot>

      <slot name="header" :header="header">
        <DocsPageHeader
          v-if="header?.enabled !== false"
          :title="header?.title ?? 'Untitled'"
          :description="header?.description"
          :section-label="header?.sectionLabel"
          :breadcrumbs="header?.breadcrumbs ?? []"
        >
          <template #actions>
            <slot name="pageActions" :header="header" />
          </template>
        </DocsPageHeader>
      </slot>

      <slot name="body">
        <slot />
      </slot>

      <slot name="footer" :footer="footer">
        <DocsPageFooter
          :enabled="footer?.enabled ?? true"
          :previous="footer?.previous"
          :next="footer?.next"
          :pager-labels="footer?.pagerLabels"
        />
      </slot>
    </article>

    <slot
      v-if="tocEnabled"
      name="toc"
      :toc="tocOptions"
      :active-id="activeId"
      :active-item="activeItem"
      :progress="progress"
    >
      <DocsToc
        :items="tocOptions.items"
        :active-id="activeId"
        :active-item="activeItem"
        :progress="progress"
        :label="tocOptions.label"
      />
    </slot>
  </div>
</template>
