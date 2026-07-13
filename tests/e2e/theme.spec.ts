import { expect, test, type Page } from '@playwright/test'
import { expectAttributeOneOf, expectCountAtLeast } from './helpers/assertions'
import {
  gotoDocsFixture,
  isNarrowViewport,
  openMobileNav,
  waitForNuxtHydration,
} from './helpers/docs-page'
import { clickFirstVisible } from './helpers/interaction'

test.describe('@fast @shell theme runtime', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('fuma-nuxt-theme')
    })
  })

  function collectConsoleDiagnostics(page: Page) {
    const diagnostics: string[] = []

    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        diagnostics.push(`${message.type()}: ${message.text()}`)
      }
    })
    page.on('pageerror', (error) => {
      diagnostics.push(`pageerror: ${error.message}`)
    })

    return diagnostics
  }

  function expectNoHydrationDiagnostics(diagnostics: string[]) {
    expect(
      diagnostics.filter((message) =>
        /hydration|hydrate|mismatch|vue warn|pageerror|error:/i.test(message),
      ),
    ).toEqual([])
  }

  async function readRootThemeState(page: Page) {
    return page.evaluate(() => {
      const root = document.documentElement

      return {
        colorScheme: root.style.colorScheme,
        isDark: root.classList.contains('dark'),
        mode: root.getAttribute('data-docs-theme-mode'),
        preset: root.getAttribute('data-docs-theme'),
        resolved: root.getAttribute('data-docs-theme-resolved'),
      }
    })
  }

  test('@responsive initializes root state and switch surfaces', async ({
    page,
  }) => {
    const diagnostics = collectConsoleDiagnostics(page)

    await page.goto('/guide/code-block', {
      waitUntil: 'domcontentloaded',
    })

    const html = page.locator('html')
    const firstPaintState = await readRootThemeState(page)

    expect(firstPaintState.preset).toBe('default')
    expect(['light', 'dark', 'system']).toContain(firstPaintState.mode)
    expect(['light', 'dark']).toContain(firstPaintState.resolved)
    expect(firstPaintState.colorScheme).toBe(firstPaintState.resolved)
    expect(firstPaintState.isDark).toBe(firstPaintState.resolved === 'dark')

    await waitForNuxtHydration(page)
    await expect(html).toHaveAttribute('data-docs-root-provider', 'true')

    await expect(html).toHaveAttribute('data-docs-theme', 'default')
    await expectAttributeOneOf(html, 'data-docs-theme-mode', [
      'light',
      'dark',
      'system',
    ])
    await expectAttributeOneOf(html, 'data-docs-theme-resolved', [
      'light',
      'dark',
    ])
    await expectCountAtLeast(page.locator('[data-theme-toggle]'), 2)
    await expectCountAtLeast(
      page.locator('.docs-header [data-theme-toggle]'),
      1,
    )
    await expectCountAtLeast(page.locator('#nd-sidebar [data-theme-toggle]'), 1)

    for (const button of await page
      .locator('[data-theme-toggle] button')
      .all()) {
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

    expectNoHydrationDiagnostics(diagnostics)
  })

  test('applies stored dark before hydration', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fuma-nuxt-theme', 'dark')
    })

    await page.goto('/guide/code-block', {
      waitUntil: 'domcontentloaded',
    })

    expect(await readRootThemeState(page)).toMatchObject({
      colorScheme: 'dark',
      isDark: true,
      mode: 'dark',
      preset: 'default',
      resolved: 'dark',
    })

    await waitForNuxtHydration(page)

    await expect(page.locator('html')).toHaveAttribute(
      'data-docs-theme-mode',
      'dark',
    )
  })

  test('applies stored light before hydration', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('fuma-nuxt-theme', 'light')
    })

    await page.goto('/guide/code-block', {
      waitUntil: 'domcontentloaded',
    })

    expect(await readRootThemeState(page)).toMatchObject({
      colorScheme: 'light',
      isDark: false,
      mode: 'light',
      preset: 'default',
      resolved: 'light',
    })

    await waitForNuxtHydration(page)

    await expect(page.locator('html')).toHaveAttribute(
      'data-docs-theme-mode',
      'light',
    )
  })

  test('applies stored system from media preference before hydration', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.addInitScript(() => {
      window.localStorage.setItem('fuma-nuxt-theme', 'system')
    })

    await page.goto('/guide/code-block', {
      waitUntil: 'domcontentloaded',
    })

    expect(await readRootThemeState(page)).toMatchObject({
      colorScheme: 'dark',
      isDark: true,
      mode: 'system',
      preset: 'default',
      resolved: 'dark',
    })

    await waitForNuxtHydration(page)

    await expect(page.locator('html')).toHaveAttribute(
      'data-docs-theme-mode',
      'system',
    )
  })

  async function revealThemeControls(page: Page) {
    if (isNarrowViewport(page)) {
      await openMobileNav(page)
    }
  }

  test('@responsive syncs dark, light, and system modes across switches', async ({
    page,
  }) => {
    await gotoDocsFixture(page, '/guide/code-block')
    await revealThemeControls(page)

    await clickFirstVisible(page, '.docs-theme-button[data-theme-mode="dark"]')
    await expect(page.locator('html')).toHaveAttribute(
      'data-docs-theme-mode',
      'dark',
    )
    await expect(page.locator('html')).toHaveAttribute(
      'data-docs-theme-resolved',
      'dark',
    )
    await expect
      .poll(() =>
        page.evaluate(() => window.localStorage.getItem('fuma-nuxt-theme')),
      )
      .toBe('dark')

    await clickFirstVisible(page, '.docs-theme-button[data-theme-mode="light"]')
    await expect(page.locator('html')).toHaveAttribute(
      'data-docs-theme-mode',
      'light',
    )
    await expect(page.locator('html')).toHaveAttribute(
      'data-docs-theme-resolved',
      'light',
    )
    await expect
      .poll(() =>
        page.evaluate(() => window.localStorage.getItem('fuma-nuxt-theme')),
      )
      .toBe('light')

    await clickFirstVisible(
      page,
      '.docs-theme-button[data-theme-mode="system"]',
    )
    const expectedSystemMode = await page.evaluate(() =>
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light',
    )

    await expect(page.locator('html')).toHaveAttribute(
      'data-docs-theme-mode',
      'system',
    )
    await expect(page.locator('html')).toHaveAttribute(
      'data-docs-theme-resolved',
      expectedSystemMode,
    )
    await expect
      .poll(() =>
        page.evaluate(() => window.localStorage.getItem('fuma-nuxt-theme')),
      )
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
      const span = document.querySelector(
        '.fd-doc-code-block.shiki-themes code span',
      )
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
