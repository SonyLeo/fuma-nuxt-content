import type { InjectionKey, Ref } from 'vue'
import type { DocsTocItem } from '~/types/docs'

const docsInlineTocKey: InjectionKey<Ref<DocsTocItem[]>> =
  Symbol('docs-inline-toc')

export function provideDocsInlineToc(items: Ref<DocsTocItem[]>) {
  provide(docsInlineTocKey, items)
}

export function useDocsInlineToc(items?: Ref<DocsTocItem[] | undefined>) {
  const providedItems = inject(docsInlineTocKey, null)

  return computed(() => {
    return items?.value ?? providedItems?.value ?? []
  })
}
