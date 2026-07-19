import { expect, test } from '@playwright/test'
import { gotoDocsFixture } from './helpers/docs-page'

test.describe('@fast search provider cutover', () => {
  test('uses the API provider without serializing the local search payload', async ({
    page,
    request,
  }) => {
    const documentResponse = await request.get('/guide/getting-started')
    const documentHtml = await documentResponse.text()

    expect(documentResponse.status()).toBe(200)
    expect(documentHtml).not.toContain('docs-search-pages')

    await gotoDocsFixture(page, '/guide/component-detail')
    await page
      .locator('.docs-search-trigger')
      .filter({ visible: true })
      .first()
      .click()

    const responsePromise = page.waitForResponse((response) => {
      const url = new URL(response.url())

      return url.pathname === '/api/search' && url.searchParams.has('query')
    })
    const input = page.getByRole('combobox', { name: 'Search' })

    await input.fill('Keyboard flow')
    await expect(page.getByRole('option', { name: /Accordion/ })).toBeVisible()

    const response = await responsePromise
    expect(response.status()).toBe(200)
    expect(new URL(response.url()).searchParams.get('limit')).toBe('8')
  })

  test('renders API failures and recovers on the next successful query', async ({
    page,
  }) => {
    await page.route('**/api/search?**', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'private provider failure' }),
      })
    })
    await gotoDocsFixture(page, '/guide/component-detail')
    await page
      .locator('.docs-search-trigger')
      .filter({ visible: true })
      .first()
      .click()

    const input = page.getByRole('combobox', { name: 'Search' })

    await input.fill('provider failure')
    await expect(page.locator('.docs-search-state')).toHaveText(
      'Search failed. Try again.',
    )
    await expect(page.locator('.docs-search-dialog')).not.toContainText(
      'private provider failure',
    )

    await page.unroute('**/api/search?**')
    await input.fill('Keyboard flow')
    await expect(page.getByRole('option', { name: /Accordion/ })).toBeVisible()
  })
})
