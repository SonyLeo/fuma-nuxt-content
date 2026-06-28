import type { ContentNavigationItem } from '@nuxt/content'
import type { DocsDirectoryMeta, DocsNode, DocsPageRecord } from '~/types/docs'
import {
  buildDocsTree,
  createDirectoryMetaMap,
  createDocsMetaMap,
  findDocsNodeByPath,
  findDocsRoot,
  findSidebarBranch,
  flattenDocsNodes,
  resolveSectionHeadline,
} from '~/utils/docs-navigation'

type DocsMetaRecord = Omit<DocsDirectoryMeta, 'stem'> & {
  stem: string
}

export function useDocsTree(
  navigation: Ref<ContentNavigationItem[] | null>,
  pages: Ref<DocsPageRecord[] | null>,
  directoryMeta: Ref<DocsMetaRecord[] | null>,
  currentPath: Ref<string>,
) {
  const pageMetaByPath = computed(() => createDocsMetaMap(pages.value))
  const directoryMetaByStem = computed(() =>
    createDirectoryMetaMap(directoryMeta.value),
  )

  const items = computed<DocsNode[]>(() =>
    buildDocsTree({
      navigation: navigation.value,
      pageMetaByPath: pageMetaByPath.value,
      directoryMetaByStem: directoryMetaByStem.value,
    }),
  )

  const contextItems = computed<DocsNode[]>(() =>
    buildDocsTree({
      navigation: navigation.value,
      pageMetaByPath: pageMetaByPath.value,
      directoryMetaByStem: directoryMetaByStem.value,
      preserveExcluded: true,
      includeHidden: true,
    }),
  )

  const flattened = computed(() => flattenDocsNodes(items.value))

  const visibleCurrent = computed(() => {
    return findDocsNodeByPath(items.value, currentPath.value)
  })

  const current = computed(() => {
    return (
      visibleCurrent.value ??
      findDocsNodeByPath(contextItems.value, currentPath.value)
    )
  })

  const contextualItems = computed(() => {
    return visibleCurrent.value ? items.value : contextItems.value
  })

  const headline = computed(() => {
    return resolveSectionHeadline(contextualItems.value, currentPath.value)
  })

  const sidebarItems = computed(() => {
    if (visibleCurrent.value) {
      return findSidebarBranch(items.value, currentPath.value).filter(
        (item) => !item.hidden,
      )
    }

    const contextRoot = findDocsRoot(contextItems.value, currentPath.value)
    const rootPath = contextRoot?.path ?? contextRoot?.index?.path

    return findSidebarBranch(items.value, rootPath ?? currentPath.value).filter(
      (item) => !item.hidden,
    )
  })

  return {
    items,
    contextItems,
    contextualItems,
    flattened,
    current,
    headline,
    sidebarItems,
  }
}
