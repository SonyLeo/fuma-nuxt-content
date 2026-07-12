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

  test('skips an external directory index and uses the first visible internal child', async ({
    page,
  }) => {
    await gotoDocsFixture(page, '/guide/protocol-playground/link-index')

    await expect(page).toHaveURL(
      /\/guide\/protocol-playground\/link-index\/child$/,
    )
    await expect(page.locator('h1').first()).toContainText('Link Index Child')
  })

  test('uses only the resolved public route and canonical identity', async ({
    page,
  }) => {
    await page.goto(
      '/guide/protocol-playground/route-contract?from=identity#expected',
    )
    await expect(page.locator('h1').first()).toContainText('Routing Contract')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/guide\/protocol-playground\/route-contract$/,
    )

    const legacyResponse = await page.request.get(
      '/guide/protocol-playground/routing',
    )
    expect(legacyResponse.status()).toBe(404)

    await page.goto(
      '/guide/protocol-playground/%E7%9C%9F%E5%AE%9E%20%E8%B7%AF%E5%BE%84',
    )
    await expect(page.locator('h1').first()).toContainText('Path Policy')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/guide\/protocol-playground\/%E7%9C%9F%E5%AE%9E%20%E8%B7%AF%E5%BE%84$/,
    )
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

  test('searches context-only pages by canonical route and excludes hidden pages', async ({
    page,
  }) => {
    await gotoDocsFixture(page, '/guide/component-detail')

    await page
      .locator('.docs-search-trigger')
      .filter({ visible: true })
      .first()
      .click()

    const input = page.locator('.docs-search-input')
    const resultByTitle = (title: string) =>
      page.locator('.docs-search-result-link-inner', { hasText: title })

    await input.fill('Archive Note')
    await expect(resultByTitle('Archive Note')).toHaveAttribute(
      'href',
      '/guide/protocol-playground/archive',
    )

    await input.fill('Routing Contract')
    await expect(resultByTitle('Routing Contract')).toHaveAttribute(
      'href',
      '/guide/protocol-playground/route-contract',
    )

    await input.fill('breadcrumb、pager、sidebar')
    await expect(resultByTitle('Path Policy')).toHaveAttribute(
      'href',
      '/guide/protocol-playground/%E7%9C%9F%E5%AE%9E%20%E8%B7%AF%E5%BE%84',
    )

    await input.fill('Fuma Nuxt Content')
    await expect(page.locator('.docs-search-result-link')).toHaveCount(0)
    await expect(page.locator('.docs-search-state')).toHaveText(
      'No results found.',
    )
  })
})
