import { expect, test, type Page } from '@playwright/test'
import { expectAttributeOneOf, expectCountAtLeast } from './helpers/assertions'
import {
  gotoDocsFixture,
  isNarrowViewport,
  openMobileNav,
} from './helpers/docs-page'
import { clickFirstVisible } from './helpers/interaction'

test.describe('@fast @shell theme runtime', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('fuma-nuxt-theme')
    })
  })

  test('initializes root state and switch surfaces', async ({ page }) => {
    await gotoDocsFixture(page, '/guide/code-block')

    const html = page.locator('html')

    await expect(html).toHaveAttribute('data-docs-theme', 'default')
    await expectAttributeOneOf(html, 'data-docs-theme-mode', [
      'light',
      'dark',
      'system',
    ])
    await expectAttributeOneOf(html, 'data-docs-theme-resolved', ['light', 'dark'])
    await expectCountAtLeast(page.locator('[data-theme-toggle]'), 2)
    await expectCountAtLeast(page.locator('.docs-header [data-theme-toggle]'), 1)
    await expectCountAtLeast(page.locator('#nd-sidebar [data-theme-toggle]'), 1)

    for (const button of await page.locator('[data-theme-toggle] button').all()) {
      await expect(button).toHaveAttribute('aria-label', /.+/)
      await expectAttributeOneOf(button, 'aria-pressed', ['true', 'false'])
    }

    if (isNarrowViewport(page)) {
      await openMobileNav(page)
      await expectCountAtLeast(
        page.locator('.docs-mobile-nav-panel [data-theme-toggle]'),
        1,
      )
    }
  })

  async function revealThemeControls(page: Page) {
    if (isNarrowViewport(page)) {
      await openMobileNav(page)
    }
  }

  test('syncs dark, light, and system modes across switches', async ({ page }) => {
    await gotoDocsFixture(page, '/guide/code-block')
    await revealThemeControls(page)

    await clickFirstVisible(page, '.docs-theme-button[data-theme-mode="dark"]')
    await expect(page.locator('html')).toHaveAttribute('data-docs-theme-mode', 'dark')
    await expect(page.locator('html')).toHaveAttribute(
      'data-docs-theme-resolved',
      'dark',
    )
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem('fuma-nuxt-theme')))
      .toBe('dark')

    await clickFirstVisible(page, '.docs-theme-button[data-theme-mode="light"]')
    await expect(page.locator('html')).toHaveAttribute('data-docs-theme-mode', 'light')
    await expect(page.locator('html')).toHaveAttribute(
      'data-docs-theme-resolved',
      'light',
    )
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem('fuma-nuxt-theme')))
      .toBe('light')

    await clickFirstVisible(page, '.docs-theme-button[data-theme-mode="system"]')
    const expectedSystemMode = await page.evaluate(() =>
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    )

    await expect(page.locator('html')).toHaveAttribute('data-docs-theme-mode', 'system')
    await expect(page.locator('html')).toHaveAttribute(
      'data-docs-theme-resolved',
      expectedSystemMode,
    )
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem('fuma-nuxt-theme')))
      .toBe('system')
  })

  test('keeps code theme tokens reachable in dark mode', async ({ page }) => {
    await gotoDocsFixture(page, '/guide/code-block')
    await revealThemeControls(page)

    await clickFirstVisible(page, '.docs-theme-button[data-theme-mode="dark"]')

    const themedBlock = page.locator('.fd-doc-code-block.shiki-themes').first()
    const blockCount = await themedBlock.count()

    test.skip(blockCount === 0, 'Fixture has no themed Shiki block.')

    await expect(themedBlock).toHaveClass(/catppuccin-mocha/)

    const tokenState = await page.evaluate(() => {
      const root = document.documentElement
      const span = document.querySelector('.fd-doc-code-block.shiki-themes code span')
      const style = getComputedStyle(root)

      return {
        fdPrimary: style.getPropertyValue('--color-fd-primary').trim(),
        primary: style.getPropertyValue('--docs-color-primary').trim(),
        tokenColor: span ? getComputedStyle(span).color : '',
      }
    })

    expect(tokenState.primary).toBe(tokenState.fdPrimary)
    expect(tokenState.tokenColor.length).toBeGreaterThan(0)
  })
})
