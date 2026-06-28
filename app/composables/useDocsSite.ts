import { docsSiteConfig } from '~/config/docs-site'
import { createDocsSiteLayoutProps } from '~/utils/docs-site'

export function useDocsSite() {
  const layout = computed(() => createDocsSiteLayoutProps(docsSiteConfig))

  return {
    site: docsSiteConfig,
    layout,
  }
}
