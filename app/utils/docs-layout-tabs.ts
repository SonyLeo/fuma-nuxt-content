import type {
  DocsLayoutTab,
  DocsLayoutTabMode,
  DocsNavLink,
  DocsNavOptions,
} from '~/types/docs'
import { isDocsLinkActive } from '~/utils/docs-link'

export function resolveDocsLayoutTabMode(
  mode: DocsLayoutTabMode | undefined,
): DocsLayoutTabMode {
  return mode ?? 'auto'
}

export function resolveDocsLayoutTabs(
  nav: DocsNavOptions | undefined,
): DocsLayoutTab[] {
  return (nav?.tabs ?? []).filter(isDocsLayoutTab)
}

export function findActiveDocsLayoutTab(
  tabs: DocsLayoutTab[],
  currentPath: string,
) {
  return (
    [...tabs]
      .reverse()
      .find((tab) =>
        isDocsLayoutTabActive(tab, currentPath),
      ) ?? tabs[0]
  )
}

export function isDocsLayoutTabActive(
  tab: DocsLayoutTab,
  currentPath: string,
) {
  return isDocsLinkActive(tab.href, currentPath, tab.active ?? 'nested-url')
}

function isDocsLayoutTab(link: DocsNavLink): link is DocsLayoutTab {
  return Boolean(link.href)
}
