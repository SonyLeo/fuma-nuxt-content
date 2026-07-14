import { expect, test } from '@playwright/test'
import { expectCountAtLeast } from '../helpers/assertions'
import { gotoComponentsPage } from '../helpers/content-components'

test.describe('@content-components tabs accordion files', () => {
  test('@responsive @tabs switches tabs and preserves code-tabs shell', async ({
    page,
  }) => {
    await gotoComponentsPage(page)

    const firstTabs = page
      .locator('.fd-doc-tabs:not(.fd-doc-code-tabs)')
      .first()
    const simpleTabs = page
      .locator('.fd-doc-tabs:not(.fd-doc-code-tabs)')
      .nth(1)
    const codeTabs = page.locator('.fd-doc-code-tabs').first()

    await expect(firstTabs).toBeVisible()
    await expect(firstTabs).toHaveCSS('display', 'flex')
    await expect(firstTabs.locator(':scope > .fd-doc-tabs-list')).toHaveCSS(
      'flex-wrap',
      'nowrap',
    )
    await expect(
      firstTabs.locator('.fd-doc-tab-trigger[data-state="active"]'),
    ).toHaveCSS('border-bottom-width', /.+/)

    await firstTabs
      .locator('.fd-doc-tab-trigger')
      .filter({ hasText: 'Code' })
      .click()
    await expect(
      firstTabs.locator('.fd-doc-tab-trigger').filter({ hasText: 'Code' }),
    ).toHaveAttribute('data-state', 'active')
    await expect(
      firstTabs.locator('.fd-doc-tab-trigger').filter({ hasText: 'Code' }),
    ).toHaveAttribute('aria-selected', 'true')
    await expect(
      firstTabs.locator('.fd-doc-tab-panel[data-state="inactive"][hidden]'),
    ).not.toHaveCount(0)

    await expect(simpleTabs.locator('.fd-doc-tabs-label')).toHaveText('Mode')
    await expect(simpleTabs.locator('.fd-doc-tab-trigger')).toHaveCount(3)
    await expect(
      simpleTabs.locator('.fd-doc-tab-trigger[data-state="active"]'),
    ).toHaveText('Code Example')

    await expect(codeTabs).toBeVisible()
    await expect(codeTabs).toHaveCSS('display', 'flex')
    await expect(codeTabs.locator('.fd-doc-tab-trigger')).toHaveCount(2)
    await expect(
      codeTabs.locator('.fd-doc-tab-trigger[data-state="active"]'),
    ).toHaveText('pnpm')
    await expect(
      codeTabs.locator(
        '.fd-doc-tab-panel[data-state="active"] .fd-doc-code-block',
      ),
    ).toHaveCount(1)
  })

  test('B3 grouped MDC tabs synchronize and restore exact storage values', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('__tabs-b3-initialized') === null) {
        localStorage.removeItem('package-manager')
        sessionStorage.removeItem('package-manager')
        sessionStorage.setItem('__tabs-b3-initialized', 'true')
      }
    })
    await gotoComponentsPage(page)

    const groupedTabs = page.locator('.fd-doc-tabs').filter({
      has: page.getByText('Package manager', { exact: true }),
    })
    const synchronizedTabs = page.locator('.fd-doc-tabs').filter({
      has: page.getByText('Synchronized', { exact: true }),
    })
    const ungroupedTabs = page.locator('.fd-doc-tabs').filter({
      has: page.getByText('Mode', { exact: true }),
    })

    await expect(groupedTabs).toHaveCount(1)
    await expect(synchronizedTabs).toHaveCount(1)
    await expect(
      ungroupedTabs.getByRole('tab', { name: 'Code Example', exact: true }),
    ).toHaveAttribute('aria-selected', 'true')

    await groupedTabs.getByRole('tab', { name: 'npm', exact: true }).click()
    await expect(
      groupedTabs.getByRole('tab', { name: 'npm', exact: true }),
    ).toHaveAttribute('aria-selected', 'true')
    await expect(
      synchronizedTabs.getByRole('tab', { name: 'npm', exact: true }),
    ).toHaveAttribute('aria-selected', 'true')
    await expect(
      synchronizedTabs.locator('[role="tabpanel"][data-state="active"]'),
    ).toContainText('follows npm')
    await expect(
      synchronizedTabs.locator(
        '[role="tabpanel"][data-state="inactive"][hidden]',
      ),
    ).toHaveCount(1)
    await expect
      .poll(() =>
        page.evaluate(() => sessionStorage.getItem('package-manager')),
      )
      .toBe('npm')
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('package-manager')))
      .toBe('npm')

    await page.reload()
    await expect(
      page
        .locator('.fd-doc-tabs')
        .filter({ has: page.getByText('Package manager', { exact: true }) })
        .getByRole('tab', { name: 'npm', exact: true }),
    ).toHaveAttribute('aria-selected', 'true')

    await page.evaluate(() => sessionStorage.removeItem('package-manager'))
    await page.evaluate(() => localStorage.setItem('package-manager', 'pnpm'))
    await page.reload()
    await expect(
      page
        .locator('.fd-doc-tabs')
        .filter({ has: page.getByText('Package manager', { exact: true }) })
        .getByRole('tab', { name: 'pnpm', exact: true }),
    ).toHaveAttribute('aria-selected', 'true')
  })

  test('@accordion opens accordion item and keeps hidden-until-found protocol', async ({
    page,
  }) => {
    await gotoComponentsPage(page)

    const accordion = page.locator('.fd-doc-accordions').first()

    await expect(accordion).toHaveAttribute('data-type', 'single')
    await expectCountAtLeast(accordion.locator('.fd-doc-accordion-item'), 3)
    await expect(
      accordion
        .locator(
          '.fd-doc-accordion-item[data-state="closed"] .fd-doc-accordion-panel',
        )
        .first(),
    ).toHaveAttribute('hidden', 'until-found')
    await expectCountAtLeast(accordion.locator('.fd-doc-accordion-copy'), 1)

    const trigger = accordion.locator('.fd-doc-accordion-trigger').nth(1)

    await trigger.click()

    const opened = accordion.locator(
      '.fd-doc-accordion-item[data-accordion-value="why-not-vitepress"]',
    )

    await expect(opened).toHaveAttribute('data-state', 'open')
    await expect(opened.locator('.fd-doc-accordion-trigger')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(opened.locator('.fd-doc-accordion-panel')).toHaveAttribute(
      'role',
      'region',
    )
  })

  test('@responsive @files renders files tree states, indentation, and truncation', async ({
    page,
  }) => {
    await gotoComponentsPage(page)

    const trees = page.locator('.fd-doc-files')

    await expectCountAtLeast(trees, 2)
    await expectCountAtLeast(
      page.locator('.fd-doc-file,.fd-doc-folder-trigger'),
      8,
    )
    await expect(
      page.locator('.fd-doc-folder-trigger').filter({ hasText: 'app' }),
    ).toHaveAttribute('aria-expanded', 'true')
    await expect(
      page.locator('.fd-doc-folder-trigger').filter({ hasText: 'components' }),
    ).toHaveAttribute('aria-expanded', 'true')

    const server = page
      .locator('.fd-doc-folder-trigger')
      .filter({ hasText: 'server' })

    await expect(server).toHaveAttribute('aria-expanded', 'false')
    await server.click()
    await expect(server).toHaveAttribute('aria-expanded', 'true')

    const disabled = page.locator('.fd-doc-folder-trigger').filter({
      hasText: 'node_modules',
    })

    await expect(disabled).toBeDisabled()
    await expect(disabled).toHaveAttribute('aria-expanded', 'false')
    await expect(
      page
        .locator('.fd-doc-folder-content')
        .filter({ hasText: 'DocCodeBlock.vue' })
        .first(),
    ).toHaveCSS('border-left-width', '1px')

    const longName = page.locator('.fd-doc-file-name').filter({
      hasText: 'ExceedinglyLongFileName',
    })

    await expect(longName).toHaveCSS('overflow', 'hidden')
    await expect(longName).toHaveCSS('text-overflow', 'ellipsis')
    await expect(longName).toHaveCSS('white-space', 'nowrap')
    await expect(longName).toHaveAttribute(
      'title',
      await longName.textContent(),
    )
  })
})
