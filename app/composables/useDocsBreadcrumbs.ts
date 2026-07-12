import type { DocsBreadcrumbItem, DocsBreadcrumbOptions } from '~/types/docs'
import type { DocsPageTreeRuntime } from '~/utils/docs-page-tree-runtime'

export function useDocsBreadcrumbs(
  runtime: Ref<DocsPageTreeRuntime>,
  currentPath: Ref<string>,
  options: DocsBreadcrumbOptions | Ref<DocsBreadcrumbOptions> = {},
) {
  const breadcrumbs = computed<DocsBreadcrumbItem[]>(() => {
    const resolvedOptions = isRef(options) ? options.value : options

    return runtime.value.getBreadcrumbs(currentPath.value, resolvedOptions)
  })

  return {
    breadcrumbs,
  }
}
