import { expect, type Locator, type Page } from '@playwright/test'

export function isNarrowViewport(page: Page) {
  return (page.viewportSize()?.width ?? 0) < 960
}

export async function waitForNuxtHydration(page: Page) {
  await page.waitForFunction(() => {
    const root = document.querySelector('#__nuxt') as
      | (Element & { __vue_app__?: unknown })
      | null
    const hydrated = (window as Window & { __docsHydrated?: boolean })
      .__docsHydrated

    return (
      Boolean(root?.__vue_app__) &&
      hydrated === true &&
      document.documentElement.getAttribute('data-docs-hydrated') === 'true'
    )
  })
}

export async function gotoDocsFixture(
  page: Page,
  path = '/guide/component-detail',
) {
  await page.goto(path, {
    waitUntil: 'domcontentloaded',
  })
  await waitForNuxtHydration(page)
  await expect(page.locator('html')).toHaveAttribute(
    'data-docs-root-provider',
    'true',
  )
}

export async function openMobileNav(page: Page) {
  const trigger = page.locator('#docs-header-sidebar-trigger')
  await expect(trigger).toBeVisible()
  await trigger.click()

  const panel = page.locator('#nd-sidebar-mobile')
  await expect(panel).toBeVisible()
  await expect(panel).toHaveAttribute('data-state', 'open')
  await expect(panel).toHaveCSS(
    'transform',
    /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/,
  )
  await expect(page.locator('#nd-docs-layout')).toHaveAttribute(
    'data-sidebar-mobile-open',
    'true',
  )

  return panel
}

export async function activeSidebarScope(page: Page): Promise<Locator> {
  if (isNarrowViewport(page)) {
    return openMobileNav(page)
  }

  const sidebar = page.locator('#nd-sidebar')
  await expect(sidebar).toBeVisible()

  return sidebar
}
