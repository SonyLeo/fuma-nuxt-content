import { expect, test } from '@playwright/test'
import { expectCountAtLeast, expectVisibleBox } from './helpers/assertions'
import { gotoDocsFixture } from './helpers/docs-page'

const expectedOpenOptions = [
  'Open in GitHub',
  'Edit page',
  'Open in Scira AI',
  'Open in ChatGPT',
  'Open in Claude',
  'Open in Cursor',
]

test.describe('@fast @page-actions page actions and tail', () => {
  test('@responsive renders preview frame, page actions, and open menu contract', async ({
    page,
  }) => {
    await gotoDocsFixture(page, '/guide/components')

    const preview = page.locator('.fd-doc-preview').last()

    await expect(preview).toBeVisible()
    await expect(preview.locator('.fd-doc-preview-canvas')).toBeVisible()
    await expect(preview.locator('.fd-doc-preview-source')).toBeVisible()
    await expect(preview.locator('.fd-doc-code-block')).toBeVisible()
    await expect(preview.locator('doccodeblock, previewcounter')).toHaveCount(0)

    const actions = page.locator('.docs-page-actions')
    const copy = page.locator(
      '.docs-page-action[data-action-id="copy-markdown"]',
    )
    const open = page.locator('.docs-page-open-trigger')

    await expect(actions).toBeVisible()
    await expect(actions).toHaveCSS('align-items', 'center')
    await expect(copy).toHaveText('Copy Markdown')
    await expect(copy).toHaveCSS('font-size', '12px')
    await expect(open).toHaveText(/Open/)
    await expect(open).toHaveCSS('font-size', '12px')

    const copyBox = await expectVisibleBox(copy)
    const openBox = await expectVisibleBox(open)

    expect(
      Math.abs((copyBox?.height ?? 0) - (openBox?.height ?? 0)),
    ).toBeLessThanOrEqual(1)

    await open.click()
    await expect(open).toHaveAttribute('aria-expanded', 'true')
    await expect(open).toHaveAttribute('data-state', 'open')

    const popover = page.locator('.docs-page-open-popover')

    await expect(popover).toBeVisible()

    const popoverBox = await expectVisibleBox(popover)
    const viewportWidth = page.viewportSize()?.width ?? 0

    expect(popoverBox?.width ?? 0).toBeGreaterThanOrEqual(230)
    expect(popoverBox?.x ?? 0).toBeGreaterThanOrEqual(8)
    expect((popoverBox?.x ?? 0) + (popoverBox?.width ?? 0)).toBeLessThanOrEqual(
      viewportWidth - 8 + 4,
    )

    for (const label of expectedOpenOptions) {
      const option = page
        .locator('.docs-page-open-option')
        .filter({ hasText: label })

      await expect(option).toBeVisible()
      await expect(option).toHaveAttribute('target', '_blank')
      await expect(option).toHaveCSS('display', 'flex')
      await expect(option).toHaveCSS('font-size', '14px')
    }
  })

  test('keeps feedback and pager interactions reachable', async ({ page }) => {
    await gotoDocsFixture(page, '/guide/components')

    const feedback = page.locator('.docs-feedback')

    await feedback.scrollIntoViewIfNeeded()
    await expect(feedback).toBeVisible()
    await expect(feedback.locator('.docs-feedback-button')).toHaveCount(2)
    await feedback.locator('.docs-feedback-button').first().click()
    await expect(
      feedback.locator('.docs-feedback-button').first(),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(feedback.locator('.docs-feedback-thanks')).toBeVisible()

    const pager = page.locator('.docs-pager')

    await expect(pager).toBeVisible()
    await expectCountAtLeast(pager.locator('.docs-pager-link'), 1)

    for (const link of await pager.locator('.docs-pager-link').all()) {
      await expect(link).toHaveAttribute('href', /.+/)
      await expect(link.locator('.docs-pager-title')).toBeVisible()
      await expect(link.locator('.docs-pager-icon')).toBeVisible()
    }
  })
})
