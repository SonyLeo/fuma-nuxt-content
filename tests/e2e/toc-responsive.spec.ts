import { expect, test } from '@playwright/test'
import {
  expectBoxInside,
  expectDocumentNoHorizontalOverflow,
  expectVisibleBox,
} from './helpers/assertions'
import { gotoDocsFixture, isNarrowViewport, openMobileNav } from './helpers/docs-page'
import {
  expectElementClearsLeft,
  expectElementsDoNotOverlap,
  isDesktopTocViewport,
} from './helpers/layout'

test.describe('@fast @shell toc responsive', () => {
  test('keeps shell columns and document width stable', async ({ page }) => {
    await gotoDocsFixture(page, '/guide/component-detail')

    await expectDocumentNoHorizontalOverflow(page)
    await expect(page.locator('.docs-shell-content')).toBeVisible()
    await expect(page.locator('.docs-page-frame')).toBeVisible()
    await expect(page.locator('#nd-page')).toBeVisible()
    await expectBoxInside(page.locator('.docs-shell-content'), page.locator('.docs-page-frame'))

    if (!isNarrowViewport(page)) {
      await expectElementClearsLeft(page.locator('#nd-sidebar'), page.locator('.docs-shell-content'))
    }

    if (isDesktopTocViewport(page)) {
      await expect(page.locator('#nd-toc')).toBeVisible()
      await expect(page.locator('#nd-toc')).toHaveCSS('display', /.+/)
      await expect(page.locator('#nd-toc')).toHaveCSS('width', /2[4-9]\dpx|3\d\dpx/)
      await expectElementsDoNotOverlap(page.locator('#nd-page'), page.locator('#nd-toc'))
      await expect(page.locator('.docs-toc-popover')).toBeHidden()
    } else {
      await expect(page.locator('#nd-toc')).toBeHidden()
      await expect(page.locator('.docs-page-frame')).toHaveCSS(
        'grid-template-areas',
        /toc-popover/,
      )
      await expect(page.locator('.docs-toc-popover')).toBeVisible()
      await expect(page.locator('.docs-toc-popover-trigger')).toHaveAttribute(
        'aria-expanded',
        'false',
      )
    }
  })

  test('opens and closes responsive toc popover with real interactions', async ({
    page,
  }) => {
    test.skip(isDesktopTocViewport(page), 'Desktop uses the persistent TOC rail.')

    await gotoDocsFixture(page, '/guide/component-detail')

    const trigger = page.locator('.docs-toc-popover-trigger')

    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('.docs-toc-popover-panel')).toBeVisible()
    await expectBoxInside(page.locator('.docs-shell-content'), page.locator('.docs-toc-popover-panel'))
    await expect(page.locator('.docs-toc-popover-panel a').first()).toBeVisible()

    const maxHeight = await page
      .locator('.docs-toc-popover-scroll')
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).maxHeight))
    const viewportHeight = page.viewportSize()?.height ?? 0

    expect(maxHeight).toBeLessThanOrEqual(viewportHeight * 0.5 + 1)

    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.mouse.click(1, 1)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.locator('.docs-toc-popover-panel a').first().click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('keeps sticky toc below mobile header and mobile drawer clickable', async ({
    page,
  }) => {
    test.skip(!isNarrowViewport(page), 'Only mobile has sticky header plus drawer.')

    await gotoDocsFixture(page, '/guide/component-detail')

    await page.evaluate(() => {
      window.scrollTo(0, Math.min(700, document.documentElement.scrollHeight - innerHeight))
    })
    await expectVisibleBox(page.locator('.docs-header'))

    const headerBox = await page.locator('.docs-header').boundingBox()
    const triggerBox = await page.locator('.docs-toc-popover-trigger').boundingBox()

    expect(triggerBox?.y ?? 0).toBeGreaterThanOrEqual(
      (headerBox?.y ?? 0) + (headerBox?.height ?? 0) - 1,
    )

    await openMobileNav(page)
    await expectDocumentNoHorizontalOverflow(page)
  })
})
