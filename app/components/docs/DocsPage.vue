<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { DocsPageProps, DocsTocItem } from '~/types/docs'

const props = withDefaults(defineProps<DocsPageProps>(), {
  full: false,
  header: undefined,
  toc: undefined,
  breadcrumb: undefined,
  footer: undefined,
})
const articleRef = shallowRef<HTMLElement | null>(null)

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

const scannedTocItems = shallowRef<DocsTocItem[]>([])
const tocItems = computed(() => {
  const providedItems = props.toc?.items ?? []
  return providedItems.length > 0 ? providedItems : scannedTocItems.value
})
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

function scanRenderedHeadings() {
  if (!import.meta.client || (props.toc?.items?.length ?? 0) > 0) {
    return
  }

  const article = articleRef.value
  if (!article) {
    return
  }

  const headings = Array.from(
    article.querySelectorAll<HTMLElement>(
      '.docs-page-body h2[id], .docs-page-body h3[id], .docs-page-body h4[id]',
    ),
  )

  scannedTocItems.value = headings.map((heading) => {
    return {
      id: heading.id,
      text: heading.textContent?.trim() ?? heading.id,
      depth: Number(heading.tagName.slice(1)),
    }
  })
}

function setArticleRef(element: Element | ComponentPublicInstance | null) {
  articleRef.value = element instanceof HTMLElement ? element : null
}

onMounted(async () => {
  await nextTick()
  scanRenderedHeadings()

  requestAnimationFrame(() => {
    scanRenderedHeadings()
  })

  window.setTimeout(() => {
    scanRenderedHeadings()
  }, 250)
})

onUpdated(() => {
  scanRenderedHeadings()
})
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

    <article
      id="nd-page"
      :ref="setArticleRef"
      class="docs-page"
      :class="{ 'is-full': full }"
    >
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
