import type { InjectionKey, Ref } from 'vue'
import type { DocsPageRecord } from '~/types/docs'
import type { ResolveDocsLinkOptions } from '~/utils/docs-link'
import { resolveDocsLink } from '~/utils/docs-link'

type DocsLinkContext = {
  currentSourcePath: Ref<string | null | undefined>
  pages: Ref<DocsPageRecord[]>
}

const docsLinkContextKey: InjectionKey<DocsLinkContext> =
  Symbol('docs-link-context')

export function provideDocsLinkContext(context: DocsLinkContext) {
  provide(docsLinkContextKey, context)
}

export function useDocsResolvedLink(
  href: Ref<string | null | undefined>,
  options?: Ref<Omit<ResolveDocsLinkOptions, 'currentSourcePath' | 'pages'>>,
) {
  const context = inject(docsLinkContextKey, null)

  return computed(() =>
    resolveDocsLink(href.value, {
      ...(options?.value ?? {}),
      currentSourcePath: context?.currentSourcePath.value,
      pages: context?.pages.value,
    }),
  )
}
