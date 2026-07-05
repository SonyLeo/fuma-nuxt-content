import { expect, test } from '@playwright/test'
import { expectBoxInside, expectCountAtLeast } from './helpers/assertions'
import { gotoDocsFixture } from './helpers/docs-page'

test.describe('@fast @content image zoom', () => {
  test('opens and closes zoomed documentation images', async ({ page }) => {
    await gotoDocsFixture(page, '/guide/zoomable-image')

    const figures = page.locator('.fd-doc-image[data-zoomable="true"]')
    const trigger = figures.first().locator('.fd-doc-image-trigger')

    await expectCountAtLeast(figures, 2)
    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger.locator('img')).toHaveAttribute(
      'src',
      '/docs-image-zoom-sample.svg',
    )
    await expect(trigger.locator('.fd-doc-image-zoom-hint')).toBeVisible()

    await trigger.click()

    const overlay = page.locator('.fd-doc-image-zoom-overlay')
    const content = page.locator('.fd-doc-image-zoom-content')
    const zoomImage = page.locator('.fd-doc-image-zoom-img')

    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(overlay).toBeVisible()
    await expect(content).toBeVisible()
    await expect(content).toHaveAttribute('role', 'dialog')
    await expect(zoomImage).toHaveAttribute('src', '/docs-image-zoom-sample.svg')
    await expectBoxInside(overlay, zoomImage)

    const imageBox = await zoomImage.boundingBox()
    const viewport = page.viewportSize()

    expect(imageBox?.width ?? 0).toBeGreaterThan(0)
    expect(imageBox?.height ?? 0).toBeGreaterThan(0)
    expect(imageBox?.width ?? 0).toBeLessThanOrEqual((viewport?.width ?? 0) - 24)
    expect(imageBox?.height ?? 0).toBeLessThanOrEqual((viewport?.height ?? 0) - 24)

    await page.keyboard.press('Escape')
    await expect(content).toBeHidden()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()

    await trigger.click()
    await expect(content).toBeVisible()
    await page.locator('.fd-doc-image-zoom-close').click()
    await expect(content).toBeHidden()
  })
})
