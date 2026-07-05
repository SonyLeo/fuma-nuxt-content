import { expect, test } from '@playwright/test'
import { expectAttributeOneOf, expectCountAtLeast } from './helpers/assertions'
import {
  activeSidebarScope,
  gotoDocsFixture,
  isNarrowViewport,
  openMobileNav,
  waitForNuxtHydration,
} from './helpers/docs-page'

test.describe('@layout-provider Playwright POC', () => {
  test('root provider exposes shared root state', async ({ page }) => {
    await gotoDocsFixture(page)

    const html = page.locator('html')

    await expect(html).toHaveAttribute('dir', 'ltr')
    await expect(html).toHaveAttribute('data-docs-root-provider', 'true')
    await expect(html).toHaveAttribute('data-docs-search-enabled', 'true')
    await expect(html).toHaveAttribute('data-docs-language-enabled', 'false')
    await expect(html).toHaveAttribute('data-docs-theme', /.+/)
    await expectAttributeOneOf(html, 'data-docs-theme-mode', [
      'light',
      'dark',
      'system',
    ])
    await expectAttributeOneOf(html, 'data-docs-theme-resolved', ['light', 'dark'])
    await expectCountAtLeast(page.locator('.docs-search-trigger'), 1)
    await expectCountAtLeast(page.locator('[data-theme-toggle]'), 2)

    const colorScheme = await html.evaluate((root) => getComputedStyle(root).colorScheme)

    expect(colorScheme.length).toBeGreaterThan(0)
  })

  test('layout slots keep default and replacement surfaces reachable', async ({
    page,
  }) => {
    await gotoDocsFixture(page)

    await expectCountAtLeast(page.locator('.docs-header [data-theme-toggle]'), 1)
    await expectCountAtLeast(page.locator('#nd-sidebar [data-theme-toggle]'), 1)
    await expectCountAtLeast(page.locator('.docs-header .docs-search-trigger'), 1)
    await expectCountAtLeast(page.locator('#nd-sidebar .docs-search-trigger'), 1)
    await expect(page.locator('[data-docs-language-select]')).toHaveCount(0)

    if (isNarrowViewport(page)) {
      await openMobileNav(page)
      await expectCountAtLeast(
        page.locator('.docs-mobile-nav-panel [data-theme-toggle]'),
        1,
      )
    }
  })

  test('search dialog keeps result scroll area usable', async ({ page }) => {
    await gotoDocsFixture(page)

    await page
      .locator('.docs-search-trigger')
      .filter({ visible: true })
      .first()
      .click()

    const dialog = page.locator('.docs-search-dialog')
    const input = page.locator('.docs-search-input')

    await expect(dialog).toBeVisible()
    await expect(input).toBeFocused()

    await input.fill('component')

    const viewport = page.locator('.docs-search-results .ui-scroll-viewport')
    const metrics = await viewport.evaluate((element) => {
      const styles = getComputedStyle(element)

      return {
        clientHeight: element.clientHeight,
        overflowY: styles.overflowY,
        scrollHeight: element.scrollHeight,
      }
    })

    await expect(viewport).toBeVisible()
    expect(metrics.clientHeight).toBeGreaterThan(0)
    expect(metrics.scrollHeight).toBeGreaterThanOrEqual(metrics.clientHeight)
    expect(['auto', 'scroll']).toContain(metrics.overflowY)
    await expectCountAtLeast(page.locator('.docs-search-result-link'), 1)

    await page.keyboard.press('ArrowDown')
    await expect(
      page.locator('.docs-search-result-link[data-active="true"]').first(),
    ).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('sidebar provider synchronizes collapse, hover, and mobile state', async ({
    page,
  }) => {
    await gotoDocsFixture(page)

    if (isNarrowViewport(page)) {
      await openMobileNav(page)
      await expect(page.locator('.docs-mobile-nav-panel')).toBeVisible()
      await expect(page.locator('#nd-docs-layout')).toHaveAttribute(
        'data-sidebar-mobile-open',
        'true',
      )
      return
    }

    const layout = page.locator('#nd-docs-layout')
    const sidebar = page.locator('#nd-sidebar')

    await sidebar.locator('.docs-sidebar-collapse').click()
    await expect(layout).toHaveAttribute('data-sidebar-collapsed', 'true')
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true')

    await sidebar.locator('.docs-sidebar-hover-zone').dispatchEvent('pointerenter', {
      clientX: 1,
      pointerType: 'mouse',
    })
    await expect(sidebar).toHaveAttribute('data-hovered', 'true')
  })

  test('layout tabs expose active tab and accessible menu contract', async ({
    page,
  }) => {
    await gotoDocsFixture(page)

    const scope = await activeSidebarScope(page)
    const trigger = scope.locator('.docs-sidebar-tab-trigger')

    await expect(trigger).toContainText('Fumadocs UI')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    const panel = scope.locator('.docs-sidebar-tab-panel')
    await expect(panel).toHaveAttribute('role', 'menu')
    await expectCountAtLeast(panel.locator('.docs-sidebar-tab-option'), 3)
    await expect(panel.locator('.docs-sidebar-tab-option[aria-current="page"]')).toContainText(
      'Fumadocs UI',
    )

    for (const option of await panel.locator('.docs-sidebar-tab-option').all()) {
      await expect(option).toHaveAttribute('role', 'menuitem')
      await expect(option).toHaveAttribute('href', /.+/)
    }
  })

  test('home layout consumes shared options and leaves body composable', async ({
    page,
  }) => {
    await page.goto('/', {
      waitUntil: 'domcontentloaded',
    })
    await waitForNuxtHydration(page)

    await expect(page.locator('.docs-home-layout')).toBeVisible()
    await expect(page.locator('.docs-home-brand-text')).toHaveText('Fumadocs')
    await expect(page.locator('.docs-home-title')).toHaveText('Fumadocs')
    await expectCountAtLeast(page.locator('.docs-home-nav-link'), 1)
    await expectCountAtLeast(page.locator('.docs-home-tools [data-theme-toggle]'), 1)
    await expectCountAtLeast(page.locator('.docs-home-card,.docs-home-link'), 3)
    await expect(page.locator('.docs-home-content')).toBeVisible()
  })

  test('not-found shell keeps shared home layout and action contract', async ({
    page,
  }) => {
    const response = await page.goto('/__stage2_missing_page__', {
      waitUntil: 'domcontentloaded',
    })
    await waitForNuxtHydration(page)

    expect(response?.status()).toBe(404)
    await expect(page.locator('.docs-home-layout')).toBeVisible()
    await expect(page.locator('.docs-not-found')).toBeVisible()
    await expect(page.locator('.docs-not-found-code')).toHaveText('404')
    await expect(page.locator('.docs-not-found-title')).toHaveText('Page Not Found')
    await expect(page.locator('.docs-not-found-action')).toHaveAttribute('href', '/')
    await expect(page.locator('.docs-not-found-action')).toContainText('Back to Home')
    await expectCountAtLeast(page.locator('.docs-home-tools [data-theme-toggle]'), 1)
  })
})
