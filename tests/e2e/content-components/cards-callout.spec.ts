import { expect, test } from '@playwright/test'
import { expectCountAtLeast } from '../helpers/assertions'
import { gotoComponentsPage } from '../helpers/content-components'

test.describe('@content-components cards and callout', () => {
  test('@responsive @cards renders card grid protocol and responsive columns', async ({
    page,
  }) => {
    await gotoComponentsPage(page)

    const grid = page.locator('.fd-card-grid').first()
    const cards = grid.locator(':scope > [data-card]')

    await expect(grid).toBeVisible()
    await expect(grid).toHaveCSS('display', 'grid')
    await expect(grid).toHaveCSS('container-type', 'inline-size')
    await expect(grid).toHaveCSS('gap', '12px')
    await expectCountAtLeast(cards, 4)
    await expectCountAtLeast(cards.locator('.fd-doc-card-icon'), 4)
    await expect(
      cards.filter({ has: page.locator('.fd-doc-card-badge') }),
    ).not.toHaveCount(0)

    const external = cards.filter({ hasText: 'External Reference' })

    await expect(external).toHaveAttribute('target', '_blank')
    await expect(external).toHaveAttribute('rel', /noopener/)

    const firstTitle = cards.first().locator('.fd-doc-card-header h3')

    await expect(cards.first()).toHaveCSS('border-radius', '12px')
    await expect(cards.first()).toHaveCSS('padding', '16px')
    await expect(firstTitle).toHaveCSS('font-size', '14px')
    await expect(firstTitle).toHaveCSS('line-height', '20px')
    await expect(firstTitle).toHaveCSS('font-weight', '500')
    await expect(firstTitle).toHaveCSS('overflow-wrap', 'anywhere')

    const layout = await grid.evaluate((root) => {
      const gridRect = root.getBoundingClientRect()
      const columns = getComputedStyle(root)
        .gridTemplateColumns.split(' ')
        .filter(Boolean).length
      const widths = Array.from(
        root.querySelectorAll<HTMLElement>(':scope > [data-card]'),
      ).map((card) => {
        const rect = card.getBoundingClientRect()

        return {
          left: Math.round(rect.left),
          width: Math.round(rect.width),
        }
      })

      return {
        columns,
        gridLeft: Math.round(gridRect.left),
        gridWidth: Math.round(gridRect.width),
        widths,
      }
    })
    const isSingleColumn = layout.widths.every(
      (item) =>
        Math.abs(item.left - layout.gridLeft) <= 2 &&
        Math.abs(item.width - layout.gridWidth) <= 3,
    )

    if ((page.viewportSize()?.width ?? 0) <= 640) {
      expect(isSingleColumn).toBe(true)
    } else {
      expect(layout.columns).toBeGreaterThanOrEqual(2)
      expect(isSingleColumn).toBe(false)
    }
  })

  test('@responsive @callout keeps callout type, layout, and split container contracts', async ({
    page,
  }) => {
    await gotoComponentsPage(page)

    const callouts = page.locator('.fd-callout')

    await expectCountAtLeast(callouts, 9)

    const diagnostics = await callouts.evaluateAll((nodes) =>
      nodes.map((node) => {
        const root = node as HTMLElement
        const bar = root.querySelector<HTMLElement>('.fd-callout-bar')
        const icon = root.querySelector<HTMLElement>('.fd-callout-icon')
        const content = root.querySelector<HTMLElement>('.fd-callout-content')
        const title = root.querySelector<HTMLElement>('.fd-callout-title')
        const body = root.querySelector<HTMLElement>('.fd-callout-body')
        const rootStyle = getComputedStyle(root)
        const barStyle = bar ? getComputedStyle(bar) : null
        const iconStyle = icon ? getComputedStyle(icon) : null
        const titleStyle = title ? getComputedStyle(title) : null

        return {
          bodyText: body?.textContent?.trim() ?? '',
          contentHeight: content?.getBoundingClientRect().height ?? 0,
          hasBody: Boolean(body),
          hasTitle: Boolean(title),
          iconHeight: iconStyle?.height ?? '',
          iconTopDelta:
            icon && content
              ? Math.round(
                  icon.getBoundingClientRect().top -
                    content.getBoundingClientRect().top,
                )
              : 999,
          iconWidth: iconStyle?.width ?? '',
          railAlign: barStyle?.alignSelf ?? '',
          railHeight: bar?.getBoundingClientRect().height ?? 0,
          railWidth: bar?.getBoundingClientRect().width ?? 0,
          rootAlign: rootStyle.alignItems,
          rootDisplay: rootStyle.display,
          rootFontSize: rootStyle.fontSize,
          rootGap: rootStyle.gap,
          rootLineHeight: rootStyle.lineHeight,
          titleMargin: titleStyle?.margin ?? '',
          titleText: title?.textContent?.trim() ?? '',
          titleWeight: titleStyle?.fontWeight ?? '',
          type: root.getAttribute('data-callout-type'),
        }
      }),
    )
    const expectedTypes = [
      'info',
      'warning',
      'warning',
      'info',
      'success',
      'error',
      'idea',
      'info',
      'success',
    ]

    expect(
      diagnostics.slice(0, expectedTypes.length).map((item) => item.type),
    ).toEqual(expectedTypes)
    expect(
      diagnostics.every(
        (item) =>
          item.rootDisplay === 'flex' &&
          item.rootAlign === 'stretch' &&
          item.rootFontSize === '14px' &&
          item.rootGap === '8px' &&
          Number.parseFloat(item.rootLineHeight) >= 19,
      ),
    ).toBe(true)
    expect(
      diagnostics.every(
        (item) =>
          item.railWidth <= 3 &&
          item.railAlign === 'stretch' &&
          Math.abs(item.railHeight - item.contentHeight) <= 1,
      ),
    ).toBe(true)
    expect(
      diagnostics.every(
        (item) =>
          !item.hasTitle ||
          (item.titleMargin === '0px' && item.titleWeight !== '700'),
      ),
    ).toBe(true)
    expect(
      diagnostics.some(
        (item) =>
          !item.hasTitle &&
          item.hasBody &&
          item.bodyText.includes('intentionally has no title'),
      ),
    ).toBe(true)
    expect(
      diagnostics.every(
        (item) =>
          item.iconWidth === '20px' &&
          item.iconHeight === '20px' &&
          Math.abs(item.iconTopDelta) <= 1,
      ),
    ).toBe(true)
    const containerCallout = callouts
      .filter({ hasText: 'Container API' })
      .first()

    await expect(containerCallout).toHaveAttribute(
      'data-callout-type',
      'success',
    )
    await expect(containerCallout.locator('.fd-callout-title')).toContainText(
      'Container API',
    )
  })
})
