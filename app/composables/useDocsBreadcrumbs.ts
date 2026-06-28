import type {
  DocsBreadcrumbItem,
  DocsBreadcrumbOptions,
  DocsNode,
} from '~/types/docs'
import { createDocsBreadcrumbItems } from '~/utils/docs-navigation'

export function useDocsBreadcrumbs(
  items: Ref<DocsNode[]>,
  currentPath: Ref<string>,
  options: DocsBreadcrumbOptions | Ref<DocsBreadcrumbOptions> = {},
) {
  const breadcrumbs = computed<DocsBreadcrumbItem[]>(() => {
    const resolvedOptions = isRef(options) ? options.value : options

    return createDocsBreadcrumbItems(
      items.value,
      currentPath.value,
      resolvedOptions,
    )
  })

  return {
    breadcrumbs,
  }
}
