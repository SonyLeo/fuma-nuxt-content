import { expect, test } from '@playwright/test'
import { expectCountAtLeast } from '../helpers/assertions'
import { gotoComponentsPage } from '../helpers/content-components'

test.describe('@content-components inline toc type table steps', () => {
  test('@inline-toc renders inline toc expanded and collapsed interactions', async ({
    page,
  }) => {
    await gotoComponentsPage(page)

    const inlineTocs = page.locator('.fd-doc-inline-toc')
    const first = inlineTocs.first()
    const second = inlineTocs.nth(1)

    await expectCountAtLeast(inlineTocs, 2)
    await expect(first.locator('.fd-doc-inline-toc-trigger')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expectCountAtLeast(first.locator('.fd-doc-inline-toc-link'), 3)
    await expect(
      first.locator('.fd-doc-inline-toc-link.is-active'),
    ).not.toHaveCount(0)
    await expect(first.locator('.fd-doc-inline-toc-link').first()).toHaveCSS(
      'border-left-width',
      '1px',
    )

    const nestedPadding = await first
      .locator('.fd-doc-inline-toc-link')
      .evaluateAll((links) =>
        links.map((link) => getComputedStyle(link).paddingInlineStart),
      )

    expect(nestedPadding.some((value) => value !== '0px')).toBe(true)
    await expect(second.locator('.fd-doc-inline-toc-trigger')).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await expect(second.locator('.fd-doc-inline-toc-content')).toHaveCSS(
      'display',
      'none',
    )
    await second.locator('.fd-doc-inline-toc-trigger').click()
    await expect(second.locator('.fd-doc-inline-toc-trigger')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(second.locator('.fd-doc-inline-toc-content')).not.toHaveCSS(
      'display',
      'none',
    )
  })

  test('@type-table renders type table rows, details, and hash interaction', async ({
    page,
  }) => {
    await gotoComponentsPage(page)

    const table = page.locator('.fd-doc-type-table').first()

    await expect(table).toBeVisible()
    await expect(table).toHaveCSS('display', 'flex')
    await expect(table.locator('.fd-doc-type-table-head')).toHaveCSS(
      'display',
      'flex',
    )
    await expectCountAtLeast(table.locator('.fd-doc-type-row'), 4)
    await expect(
      table.locator('.fd-doc-type-row').filter({ hasText: 'title' }),
    ).toContainText('required')
    await expect(
      table.locator('.fd-doc-type-row').filter({ hasText: 'legacy' }),
    ).toContainText('deprecated')
    await expect(
      table
        .locator('.fd-doc-type-row')
        .filter({ hasText: 'onChange' })
        .locator('.fd-doc-type-value a'),
    ).toHaveAttribute('href', '/guide/components')

    const onChange = table
      .locator('.fd-doc-type-row')
      .filter({ hasText: 'onChange' })

    await onChange.locator('.fd-doc-type-trigger').click()
    await expect(onChange).toHaveAttribute('data-open', 'true')
    await expect(onChange.locator('.fd-doc-type-trigger')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(onChange.locator('.fd-doc-type-details')).toHaveCSS(
      'display',
      'grid',
    )
    await expect(onChange.locator('.fd-doc-type-meta')).toContainText(
      'Parameters',
    )
    await expect(onChange.locator('.fd-doc-type-param')).toContainText([
      'value',
      'event',
    ])
    await expect
      .poll(() => page.evaluate(() => window.location.hash))
      .toBe('#page-on-change')
  })

  test('@responsive @steps keeps steps marker, rail, and prose reset contracts', async ({
    page,
  }) => {
    await gotoComponentsPage(page)

    const diagnostics = await page.locator('.fd-steps').evaluateAll((roots) =>
      roots.map((root) => {
        const listItems = Array.from(
          root.querySelectorAll<HTMLElement>(':scope li'),
        )
        const explicitSteps = Array.from(
          root.querySelectorAll<HTMLElement>(':scope > .fd-step'),
        )
        const items = [...listItems, ...explicitSteps]

        return {
          explicitCount: explicitSteps.length,
          itemDiagnostics: items.map((item) => {
            const style = getComputedStyle(item)
            const before = getComputedStyle(item, '::before')
            const after = getComputedStyle(item, '::after')
            const first = item.firstElementChild

            return {
              afterContent: after.content,
              afterWidth: after.width,
              beforeBorderRadius: before.borderRadius,
              beforeContent: before.content,
              beforeHeight: before.height,
              beforeWidth: before.width,
              firstMarginTop: first ? getComputedStyle(first).marginTop : '',
              height: Math.round(item.getBoundingClientRect().height),
              paddingLeft: style.paddingLeft,
              position: style.position,
              tag: item.tagName.toLowerCase(),
              text: item.textContent?.trim() ?? '',
              width: Math.round(item.getBoundingClientRect().width),
            }
          }),
          listCount: listItems.length,
        }
      }),
    )
    const listRoot = diagnostics.find((item) => item.listCount >= 3)
    const explicitRoot = diagnostics.find((item) => item.explicitCount >= 3)
    const allItems = diagnostics.flatMap((item) => item.itemDiagnostics)

    expect(diagnostics.length).toBeGreaterThanOrEqual(2)
    expect(listRoot?.listCount).toBe(3)
    expect(explicitRoot?.explicitCount).toBe(3)
    expect(
      allItems.every(
        (item) =>
          item.position === 'relative' &&
          item.paddingLeft === '48px' &&
          item.beforeContent !== 'none' &&
          item.beforeWidth === '32px' &&
          item.beforeHeight === '32px' &&
          Number.parseFloat(item.beforeBorderRadius) >= 999,
      ),
    ).toBe(true)
    expect(
      allItems
        .filter((item) => item.afterContent !== 'none')
        .every((item) => item.afterWidth === '1px'),
    ).toBe(true)
    expect(
      allItems
        .filter((item) => item.tag !== 'li')
        .every((item) => item.firstMarginTop === '0px'),
    ).toBe(true)
    expect(allItems.some((item) => item.text.includes('components page'))).toBe(
      true,
    )
    expect(allItems.some((item) => item.text.includes('pnpm install'))).toBe(
      true,
    )

    if ((page.viewportSize()?.width ?? 0) <= 640) {
      expect(allItems.some((item) => item.height >= 80)).toBe(true)
    }
  })
})
