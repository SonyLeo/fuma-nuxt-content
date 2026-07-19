import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'reka-ui'
import UiTooltip from '~/components/ui/UiTooltip.vue'
import UiTooltipContent from '~/components/ui/UiTooltipContent.vue'
import UiTooltipProvider from '~/components/ui/UiTooltipProvider.vue'
import UiTooltipTrigger from '~/components/ui/UiTooltipTrigger.vue'

const TooltipHarness = defineComponent({
  setup() {
    return () =>
      h(
        UiTooltipProvider,
        { delayDuration: 0 },
        {
          default: () =>
            h(
              UiTooltip,
              { open: true },
              {
                default: () => [
                  h(
                    UiTooltipTrigger,
                    {
                      'aria-label': 'Collapse sidebar',
                      class: 'tooltip-trigger',
                      'data-testid': 'tooltip-trigger',
                    },
                    {
                      default: () => h('button', { type: 'button' }, 'Trigger'),
                    },
                  ),
                  h(
                    UiTooltipContent,
                    {
                      portal: false,
                      side: 'right',
                      align: 'start',
                      sideOffset: 10,
                      alignOffset: 2,
                    },
                    { default: () => 'Collapse sidebar' },
                  ),
                ],
              },
            ),
        },
      )
  },
})

describe('UiTooltip primitive contract', () => {
  test('maps the local wrappers to one Reka tooltip composition', async () => {
    const wrapper = await mountSuspended(TooltipHarness)

    try {
      expect(wrapper.findAllComponents(TooltipProvider)).toHaveLength(1)
      expect(wrapper.findAllComponents(TooltipRoot)).toHaveLength(1)
      expect(wrapper.findAllComponents(TooltipTrigger)).toHaveLength(1)
      expect(wrapper.findAllComponents(TooltipPortal)).toHaveLength(1)
      expect(wrapper.findAllComponents(TooltipContent)).toHaveLength(1)

      const content = wrapper.findComponent(TooltipContent)
      expect(content.props()).toMatchObject({
        side: 'right',
        align: 'start',
        sideOffset: 10,
        alignOffset: 2,
        avoidCollisions: true,
        collisionPadding: 8,
      })
      expect(wrapper.findComponent(TooltipPortal).props('disabled')).toBe(true)
      expect(
        wrapper.find('.ui-tooltip-content').attributes('forcemount'),
      ).toBeUndefined()
    } finally {
      wrapper.unmount()
    }
  })

  test('preserves trigger attributes and native button semantics', async () => {
    const wrapper = await mountSuspended(TooltipHarness)

    try {
      const trigger = wrapper.get('button[data-testid="tooltip-trigger"]')

      expect(trigger.attributes('type')).toBe('button')
      expect(trigger.attributes('aria-label')).toBe('Collapse sidebar')
      expect(trigger.classes()).toContain('tooltip-trigger')
      expect(trigger.attributes('aria-describedby')).toBeTruthy()
      expect(trigger.attributes('data-state')).toBe('instant-open')
    } finally {
      wrapper.unmount()
    }
  })

  test('installs one provider at the root and keeps portal styling contracts', async () => {
    const rootSource = await readFile(
      resolve(process.cwd(), 'app/components/docs/DocsRootProvider.vue'),
      'utf8',
    )
    const sidebarSource = await readFile(
      resolve(process.cwd(), 'app/components/docs/DocsSidebar.vue'),
      'utf8',
    )
    const contentSource = await readFile(
      resolve(process.cwd(), 'app/components/ui/UiTooltipContent.vue'),
      'utf8',
    )
    const cssSource = await readFile(
      resolve(process.cwd(), 'app/assets/css/shell.css'),
      'utf8',
    )

    expect(rootSource.match(/<UiTooltipProvider>/g)).toHaveLength(1)
    expect(sidebarSource).not.toContain('UiTooltipProvider')
    expect(contentSource).toContain('<TooltipPortal :disabled="!portal">')
    expect(contentSource).toContain(':side-offset="sideOffset"')
    expect(contentSource).toContain(':align-offset="alignOffset"')
    expect(cssSource).toContain('var(--docs-color-popover)')
    expect(cssSource).toContain('var(--docs-color-popover-foreground)')
    expect(cssSource).toContain('@media (prefers-reduced-motion: reduce)')
  })

  test('renders safely through the server path without browser globals', async () => {
    const html = await renderToString(createSSRApp(TooltipHarness))
    const componentSources = await Promise.all(
      [
        'UiTooltipProvider.vue',
        'UiTooltip.vue',
        'UiTooltipTrigger.vue',
        'UiTooltipContent.vue',
      ].map((file) =>
        readFile(resolve(process.cwd(), 'app/components/ui', file), 'utf8'),
      ),
    )

    expect(html).toContain('aria-label="Collapse sidebar"')
    for (const source of componentSources) {
      expect(source).not.toMatch(
        /\b(window|document|localStorage|sessionStorage)\b/,
      )
    }
  })
})
