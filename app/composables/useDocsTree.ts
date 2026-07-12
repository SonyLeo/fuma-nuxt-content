import type { ContentNavigationItem } from '@nuxt/content'
import type { DocsDirectoryMeta, DocsNode, DocsPageRecord } from '~/types/docs'
import {
  createDirectoryMetaMap,
  createDocsMetaMap,
} from '~/utils/docs-navigation'
import { createDocsPageTreeRuntime } from '~/utils/docs-page-tree-runtime'

type DocsMetaRecord = {
  docsMetadata: DocsDirectoryMeta
}

export function useDocsTree(
  navigation: Ref<ContentNavigationItem[] | null>,
  pages: Ref<DocsPageRecord[] | null>,
  directoryMeta: Ref<DocsMetaRecord[] | null>,
  currentPath: Ref<string>,
) {
  const pageMetaByPath = computed(() => createDocsMetaMap(pages.value))
  const directoryMetaByStem = computed(() =>
    createDirectoryMetaMap(
      directoryMeta.value?.map((record) => record.docsMetadata),
    ),
  )
  const runtime = computed(() =>
    createDocsPageTreeRuntime({
      navigation: navigation.value,
      pageMetaByPath: pageMetaByPath.value,
      directoryMetaByStem: directoryMetaByStem.value,
    }),
  )

  const items = computed<DocsNode[]>(() => runtime.value.visibleTree)

  const contextItems = computed<DocsNode[]>(() => runtime.value.contextTree)

  const flattened = computed(() => runtime.value.visibleFlat)

  const current = computed(() => {
    return runtime.value.getCurrent(currentPath.value)
  })

  const contextualItems = computed(() => {
    return runtime.value.getContextualTree(currentPath.value)
  })

  const headline = computed(() => {
    return runtime.value.getSectionHeadline(currentPath.value)
  })

  const sidebarItems = computed(() => {
    return runtime.value.getSidebarItems(currentPath.value)
  })

  return {
    runtime,
    items,
    contextItems,
    contextualItems,
    flattened,
    current,
    headline,
    sidebarItems,
  }
}
