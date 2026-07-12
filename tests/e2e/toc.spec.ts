import { expect, test } from '@playwright/test'
import { expectCountAtLeast } from './helpers/assertions'
import { gotoDocsFixture } from './helpers/docs-page'
import { isDesktopTocViewport } from './helpers/layout'

test.describe('@shell toc rail', () => {
  test('@responsive renders desktop rail or responsive popover contract', async ({
    page,
  }) => {
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
    await expect(page.locator('.docs-toc-popover-panel')).toHaveCSS(
      'display',
      'none',
    )

    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('.docs-toc-popover-panel')).toBeVisible()
    await expect(page.locator('.docs-toc-popover-panel')).toHaveCSS(
      'position',
      'static',
    )
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
    test.skip(
      !isDesktopTocViewport(page),
      'Responsive TOC active state is covered by popover specs.',
    )

    await gotoDocsFixture(page, '/guide/component-detail')

    const lastHeadingId = await page
      .locator(
        '.docs-page-body h2[id], .docs-page-body h3[id], .docs-page-body h4[id]',
      )
      .last()
      .getAttribute('id')

    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    )
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

  test('marks observed headings directly without synthetic parent active state', async ({
    page,
  }) => {
    test.skip(
      !isDesktopTocViewport(page),
      'Desktop TOC rail owns the active track.',
    )

    await gotoDocsFixture(page, '/guide/component-detail')

    await page.locator('#keyboard-flow').evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, Math.max(0, top - 32))
    })

    await expect
      .poll(() =>
        page.evaluate(() => {
          return (
            document
              .querySelector<HTMLAnchorElement>(
                '#nd-toc .docs-toc-link[href="#keyboard-flow"]',
              )
              ?.getAttribute('data-active') ?? 'false'
          )
        }),
      )
      .toBe('true')

    await expect
      .poll(() =>
        page.evaluate(() => {
          return (
            document
              .querySelector<HTMLAnchorElement>(
                '#nd-toc .docs-toc-link[href="#behavior"]',
              )
              ?.getAttribute('data-active') ?? 'false'
          )
        }),
      )
      .toBe('false')
  })

  test('sizes active track from the active item range on desktop', async ({
    page,
  }) => {
    test.skip(
      !isDesktopTocViewport(page),
      'Desktop TOC rail owns the active track.',
    )

    await gotoDocsFixture(page, '/guide/component-detail')

    await page.locator('#multiple-items').scrollIntoViewIfNeeded()

    await expect
      .poll(() =>
        page.evaluate(() => {
          const activeLinks = Array.from(
            document.querySelectorAll<HTMLAnchorElement>(
              '#nd-toc .docs-toc-link[data-active="true"]',
            ),
          )
          const track = document.querySelector<HTMLElement>(
            '#nd-toc .docs-toc-thumb-track',
          )

          if (!track || activeLinks.length === 0) {
            return false
          }

          const trackStyles = window.getComputedStyle(track)
          const trackTop = Number.parseFloat(
            trackStyles.getPropertyValue('--docs-toc-track-top'),
          )
          const trackBottom = Number.parseFloat(
            trackStyles.getPropertyValue('--docs-toc-track-bottom'),
          )
          const first = activeLinks[0]
          const last = activeLinks.at(-1)

          if (!first || !last) {
            return false
          }

          const firstStyles = window.getComputedStyle(first)
          const lastStyles = window.getComputedStyle(last)
          const firstTop =
            first.offsetTop + Number.parseFloat(firstStyles.paddingTop)
          const lastBottom =
            last.offsetTop +
            last.clientHeight -
            Number.parseFloat(lastStyles.paddingBottom)

          return (
            Math.abs(trackTop - firstTop) <= 1 &&
            Math.abs(trackBottom - lastBottom) <= 1
          )
        }),
      )
      .toBe(true)
  })
})
