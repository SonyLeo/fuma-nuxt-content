import { expect, test } from '@playwright/test'
import { expectCountAtLeast } from './helpers/assertions'
import { gotoDocsFixture } from './helpers/docs-page'
import { isDesktopTocViewport } from './helpers/layout'

test.describe('@shell toc rail', () => {
  test('renders desktop rail or responsive popover contract', async ({ page }) => {
    await gotoDocsFixture(page, '/guide/component-detail')

    if (isDesktopTocViewport(page)) {
      await expect(page.locator('#nd-toc')).toBeVisible()
      await expect(page.locator('#nd-toc')).not.toHaveCSS('display', 'none')
      await expectCountAtLeast(page.locator('#nd-toc .docs-toc-link'), 1)
      await expect(page.locator('.docs-toc-popover')).toBeHidden()
      return
    }

    const popover = page.locator('.docs-toc-popover')
    const trigger = page.locator('.docs-toc-popover-trigger')

    await expect(page.locator('#nd-toc')).toBeHidden()
    await expect(popover).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('.docs-toc-popover-panel')).toHaveCSS('display', 'none')

    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('.docs-toc-popover-panel')).toBeVisible()
    await expect(page.locator('.docs-toc-popover-panel')).toHaveCSS('position', 'static')
    await expect(page.locator('.docs-toc-popover-progress')).toHaveAttribute(
      'role',
      'progressbar',
    )
    await expect(page.locator('.docs-toc-popover-progress')).toHaveAttribute(
      'aria-valuemax',
      '1',
    )
    await expectCountAtLeast(page.locator('.docs-toc-popover-panel a'), 1)
  })

  test('updates current TOC item when scrolling to the bottom on desktop', async ({
    page,
  }) => {
    test.skip(!isDesktopTocViewport(page), 'Responsive TOC active state is covered by popover specs.')

    await gotoDocsFixture(page, '/guide/component-detail')

    const lastHeadingId = await page
      .locator('.docs-page-body h2[id], .docs-page-body h3[id], .docs-page-body h4[id]')
      .last()
      .getAttribute('id')

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect
      .poll(() =>
        page.evaluate(() => {
          const current = Array.from(
            document.querySelectorAll<HTMLAnchorElement>(
              '.docs-toc-link[aria-current]',
            ),
          ).at(-1)

          return current?.getAttribute('href') ?? null
        }),
      )
      .toBe(`#${lastHeadingId}`)
  })
})
