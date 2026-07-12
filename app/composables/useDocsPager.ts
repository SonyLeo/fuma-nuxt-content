import type { DocsPageTreeRuntime } from '~/utils/docs-page-tree-runtime'

export function useDocsPager(
  runtime: Ref<DocsPageTreeRuntime>,
  currentPath: Ref<string>,
) {
  const pager = computed(() => runtime.value.getPager(currentPath.value))
  const previous = computed(() => pager.value.previous)
  const next = computed(() => pager.value.next)

  return {
    previous,
    next,
  }
}
