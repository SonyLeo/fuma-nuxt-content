import type {
  DocsBreadcrumbItem,
  DocsBreadcrumbOptions,
  DocsNode,
} from '~/types/docs'
import type { DocsPageTreeRuntime } from '~/utils/docs-page-tree-runtime'
import { createDocsBreadcrumbItems } from '~/utils/docs-navigation'
import { isDocsPageTreeRuntime } from '~/utils/docs-page-tree-runtime'

export function useDocsBreadcrumbs(
  tree: Ref<DocsNode[] | DocsPageTreeRuntime>,
  currentPath: Ref<string>,
  options: DocsBreadcrumbOptions | Ref<DocsBreadcrumbOptions> = {},
) {
  const breadcrumbs = computed<DocsBreadcrumbItem[]>(() => {
    const resolvedOptions = isRef(options) ? options.value : options

    if (isDocsPageTreeRuntime(tree.value)) {
      return tree.value.getBreadcrumbs(currentPath.value, resolvedOptions)
    }

    return createDocsBreadcrumbItems(
      tree.value,
      currentPath.value,
      resolvedOptions,
    )
  })

  return {
    breadcrumbs,
  }
}
