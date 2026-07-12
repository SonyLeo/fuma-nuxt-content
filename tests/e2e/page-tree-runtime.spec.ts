import { expect, test } from '@playwright/test'
import { expectCountAtLeast } from './helpers/assertions'
import { activeSidebarScope, gotoDocsFixture } from './helpers/docs-page'

test.describe('@fast @shell page tree runtime', () => {
  test('@responsive feeds visible tree consumers from one runtime', async ({
    page,
  }) => {
    await gotoDocsFixture(page, '/guide/component-detail')

    const pager = page.locator('.docs-pager')
    await expect(pager).toBeVisible()
    await expectCountAtLeast(pager.locator('.docs-pager-link'), 1)

    await page
      .locator('.docs-search-trigger')
      .filter({ visible: true })
      .first()
      .click()

    const dialog = page.locator('.docs-search-dialog')
    const input = page.locator('.docs-search-input')

    await expect(dialog).toBeVisible()
    await input.fill('Keyboard flow')
    await expectCountAtLeast(page.locator('.docs-search-result-link'), 1)
    await expect(
      page.locator('.docs-search-result-title').first(),
    ).toContainText('Accordion')
    await page.keyboard.press('Escape')

    const scope = await activeSidebarScope(page)

    await expect(
      scope.locator(
        '.docs-sidebar-link[aria-current="page"] .docs-sidebar-link-label',
      ),
    ).toHaveText('Accordion')
  })

  test('redirects directory routes to the first navigable child', async ({
    page,
  }) => {
    await gotoDocsFixture(page, '/guide')

    await expect(page).toHaveURL(/\/guide\/getting-started$/)
    await expect(page.locator('h1').first()).toContainText('Getting Started')
    await expect(page.locator('html')).not.toContainText('Page not found')
  })

  test('@responsive uses context tree for excluded route breadcrumbs', async ({
    page,
  }) => {
    await gotoDocsFixture(page, '/guide/protocol-playground/archive')

    await expect(page.locator('h1').first()).toContainText('Archive Note')
    await expect(page.locator('.docs-pager')).toHaveCount(0)

    const breadcrumb = page.locator('.docs-breadcrumb')
    await expect(breadcrumb).toBeVisible()
    await expect(breadcrumb).toContainText('Protocol Root')
    await expect(breadcrumb).toContainText('Protocol Controls')
    await expect(breadcrumb).toContainText('Archive Note')

    const scope = await activeSidebarScope(page)

    await expect(
      scope.locator('.docs-sidebar-folder-link', {
        hasText: 'Protocol Playground',
      }),
    ).toBeVisible()
    await expect(
      scope.locator('.docs-sidebar-link', {
        hasText: 'Archive Note',
      }),
    ).toHaveCount(0)
  })
})
