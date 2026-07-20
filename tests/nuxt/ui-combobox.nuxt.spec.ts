import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createSSRApp, defineComponent, h, nextTick, type Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, test, vi } from 'vitest'
import {
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxRoot,
  ComboboxViewport,
} from 'reka-ui'
import UiComboboxContent from '~/components/ui/UiComboboxContent.vue'
import UiComboboxEmpty from '~/components/ui/UiComboboxEmpty.vue'
import UiComboboxInput from '~/components/ui/UiComboboxInput.vue'
import UiComboboxItem from '~/components/ui/UiComboboxItem.vue'
import UiComboboxRoot from '~/components/ui/UiComboboxRoot.vue'
import UiComboboxViewport from '~/components/ui/UiComboboxViewport.vue'

const ComboboxContentTest = ComboboxContent as unknown as Component
const ComboboxRootTest = ComboboxRoot as unknown as Component
const UiComboboxRootTest = UiComboboxRoot as unknown as Component

interface ItemFixture {
  disabled?: boolean
  label: string
  value: string
}

const defaultItems: ItemFixture[] = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
  { disabled: true, label: 'Disabled', value: 'disabled' },
]

async function settleCombobox() {
  await nextTick()
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 5))
  await nextTick()
}

function createComboboxHarness(options?: {
  contentProps?: Record<string, unknown>
  inputProps?: Record<string, unknown>
  items?: ItemFixture[]
  rootProps?: Record<string, unknown>
}) {
  const items = options?.items ?? defaultItems

  return defineComponent({
    setup() {
      return () =>
        h(
          UiComboboxRootTest,
          {
            defaultOpen: true,
            ...options?.rootProps,
          },
          {
            default: ({
              modelValue,
              open,
            }: {
              modelValue: unknown
              open: boolean
            }) => [
              h(UiComboboxInput, {
                'aria-label': 'Documentation search',
                'data-testid': 'combobox-input',
                ...options?.inputProps,
              }),
              h(
                UiComboboxContent,
                {
                  'data-testid': 'combobox-content',
                  forceMount: true,
                  ...options?.contentProps,
                },
                {
                  default: () =>
                    h(
                      UiComboboxViewport,
                      {
                        'data-testid': 'combobox-viewport',
                      },
                      {
                        default: () => [
                          ...items.map((item) =>
                            h(
                              UiComboboxItem,
                              {
                                'data-value': item.value,
                                disabled: item.disabled,
                                textValue: item.label,
                                value: item.value,
                              },
                              { default: () => item.label },
                            ),
                          ),
                          h(
                            UiComboboxEmpty,
                            { 'data-testid': 'combobox-empty' },
                            { default: () => 'No matching options' },
                          ),
                        ],
                      },
                    ),
                },
              ),
              h('output', { 'data-testid': 'root-slot' }, [
                String(open),
                ':',
                String(modelValue ?? ''),
              ]),
            ],
          },
        )
    },
  })
}

describe('UiCombobox primitive contract', () => {
  test('maps the six local wrappers to one Reka combobox composition', async () => {
    const wrapper = await mountSuspended(
      createComboboxHarness({
        contentProps: { position: 'inline' },
        rootProps: {
          by: 'id',
          highlightOnHover: true,
          ignoreFilter: true,
        },
      }),
    )

    try {
      await settleCombobox()

      expect(wrapper.findAllComponents(ComboboxRoot)).toHaveLength(1)
      expect(wrapper.findAllComponents(ComboboxInput)).toHaveLength(1)
      expect(wrapper.findAllComponents(ComboboxContent)).toHaveLength(1)
      expect(wrapper.findAllComponents(ComboboxViewport)).toHaveLength(1)
      expect(wrapper.findAllComponents(ComboboxItem)).toHaveLength(3)
      expect(wrapper.findAllComponents(ComboboxEmpty)).toHaveLength(1)

      expect(wrapper.findComponent(ComboboxRootTest).vm.$props).toMatchObject({
        by: 'id',
        highlightOnHover: true,
        ignoreFilter: true,
      })
      expect(
        wrapper.findComponent(ComboboxContentTest).vm.$props,
      ).toMatchObject({ position: 'inline' })
      expect(wrapper.get('[data-testid="root-slot"]').text()).toBe('true:')
    } finally {
      wrapper.unmount()
    }
  })

  test('forwards attrs, slots, focus API, and content dismissal events', async () => {
    const onEscape = vi.fn()
    const onPointerOutside = vi.fn()
    const onInteractOutside = vi.fn()
    const Harness = defineComponent({
      setup() {
        return () =>
          h(
            UiComboboxRootTest,
            { defaultOpen: true },
            {
              default: () => [
                h(
                  UiComboboxInput,
                  {
                    'aria-label': 'Search',
                    class: 'consumer-input',
                    'data-consumer': 'input',
                  },
                  { default: () => undefined },
                ),
                h(
                  UiComboboxContent,
                  {
                    class: 'consumer-content',
                    forceMount: true,
                    onEscapeKeyDown: onEscape,
                    onInteractOutside: onInteractOutside,
                    onPointerDownOutside: onPointerOutside,
                  },
                  {
                    default: () =>
                      h(
                        UiComboboxViewport,
                        { class: 'consumer-viewport' },
                        {
                          default: () =>
                            h(
                              UiComboboxItem,
                              { value: 'alpha' },
                              { default: () => 'Alpha' },
                            ),
                        },
                      ),
                  },
                ),
              ],
            },
          )
      },
    })
    const wrapper = await mountSuspended(Harness, {
      attachTo: document.body,
    })

    try {
      await settleCombobox()

      const inputWrapper = wrapper.findComponent(UiComboboxInput)
      const input = wrapper.get('input[data-consumer="input"]')
      expect(input.classes()).toEqual(
        expect.arrayContaining(['ui-combobox-input', 'consumer-input']),
      )

      const focusSpy = vi.spyOn(input.element as HTMLInputElement, 'focus')
      inputWrapper.vm.focus()
      expect(focusSpy).toHaveBeenCalledTimes(1)
      expect(document.activeElement).toBe(input.element)

      const content = wrapper.findComponent(UiComboboxContent)
      const rekaContent = wrapper.findComponent(ComboboxContentTest)
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      const pointerEvent = new CustomEvent('pointerDownOutside')
      const interactEvent = new CustomEvent('interactOutside')

      rekaContent.vm.$emit('escapeKeyDown', escapeEvent)
      rekaContent.vm.$emit('pointerDownOutside', pointerEvent)
      rekaContent.vm.$emit('interactOutside', interactEvent)
      await nextTick()

      expect(content.emitted('escapeKeyDown')?.[0]).toEqual([escapeEvent])
      expect(content.emitted('pointerDownOutside')?.[0]).toEqual([pointerEvent])
      expect(content.emitted('interactOutside')?.[0]).toEqual([interactEvent])
      expect(onEscape).toHaveBeenCalledWith(escapeEvent)
      expect(onPointerOutside).toHaveBeenCalledWith(pointerEvent)
      expect(onInteractOutside).toHaveBeenCalledWith(interactEvent)
      expect(wrapper.get('.consumer-content').classes()).toContain(
        'ui-combobox-content',
      )
      expect(wrapper.get('.consumer-viewport').classes()).toContain(
        'ui-combobox-viewport',
      )
    } finally {
      wrapper.unmount()
    }
  })

  test('preserves controlled and uncontrolled open contracts', async () => {
    const ControlledOpenHarness = defineComponent({
      props: {
        open: {
          type: Boolean,
          required: true,
        },
      },
      setup(props) {
        return () =>
          h(
            UiComboboxRootTest,
            { open: props.open },
            {
              default: () => [
                h(UiComboboxInput, { 'aria-label': 'Search' }),
                h(
                  UiComboboxContent,
                  { forceMount: true },
                  {
                    default: () =>
                      h(
                        UiComboboxViewport,
                        {},
                        {
                          default: () =>
                            h(
                              UiComboboxItem,
                              { value: 'alpha' },
                              { default: () => 'Alpha' },
                            ),
                        },
                      ),
                  },
                ),
              ],
            },
          )
      },
    })
    const controlled = await mountSuspended(ControlledOpenHarness, {
      props: { open: false },
    })

    try {
      const input = controlled.get('input')
      expect(input.attributes('aria-expanded')).toBe('false')

      await input.trigger('keydown', { key: 'ArrowDown' })
      expect(
        controlled.findComponent(UiComboboxRootTest).emitted('update:open'),
      ).toEqual([[true]])
      expect(input.attributes('aria-expanded')).toBe('false')

      await controlled.setProps({ open: true })
      await settleCombobox()
      expect(input.attributes('aria-expanded')).toBe('true')
    } finally {
      controlled.unmount()
    }

    const uncontrolled = await mountSuspended(
      createComboboxHarness({ rootProps: { defaultOpen: false } }),
    )

    try {
      const input = uncontrolled.get('input')
      expect(input.attributes('aria-expanded')).toBe('false')

      await input.trigger('keydown', { key: 'ArrowDown' })
      await settleCombobox()

      expect(input.attributes('aria-expanded')).toBe('true')
      expect(
        uncontrolled.findComponent(UiComboboxRootTest).emitted('update:open'),
      ).toEqual([[true]])
    } finally {
      uncontrolled.unmount()
    }
  })

  test('preserves controlled and uncontrolled model contracts', async () => {
    const controlled = await mountSuspended(
      createComboboxHarness({
        rootProps: { modelValue: 'alpha', open: true },
      }),
    )

    try {
      await settleCombobox()
      await controlled.get('[data-value="beta"]').trigger('click')
      await settleCombobox()

      expect(
        controlled
          .findComponent(UiComboboxRootTest)
          .emitted('update:modelValue'),
      ).toBeTruthy()
      expect(
        controlled.get('[data-value="alpha"]').attributes('aria-selected'),
      ).toBe('true')
    } finally {
      controlled.unmount()
    }

    const uncontrolled = await mountSuspended(
      createComboboxHarness({ rootProps: { defaultValue: 'alpha' } }),
    )

    try {
      await settleCombobox()
      await uncontrolled.get('[data-value="beta"]').trigger('click')
      await settleCombobox()

      expect(
        uncontrolled.get('[data-value="beta"]').attributes('aria-selected'),
      ).toBe('true')
      expect(uncontrolled.get('[data-testid="root-slot"]').text()).toBe(
        'false:beta',
      )
    } finally {
      uncontrolled.unmount()
    }
  })

  test('delegates combobox, listbox, option, selected, and disabled semantics to Reka', async () => {
    const wrapper = await mountSuspended(
      createComboboxHarness({
        rootProps: { defaultOpen: false, defaultValue: 'alpha' },
      }),
    )

    try {
      await settleCombobox()

      const input = wrapper.get('input')
      const content = wrapper.get('[data-testid="combobox-content"]')
      const viewport = wrapper.get('[data-testid="combobox-viewport"]')
      const selected = wrapper.get('[data-value="alpha"]')
      const disabled = wrapper.get('[data-value="disabled"]')

      expect(input.attributes('role')).toBe('combobox')
      expect(input.attributes('aria-autocomplete')).toBe('list')
      expect(input.attributes('aria-expanded')).toBe('false')

      await input.trigger('keydown', { key: 'ArrowDown' })
      await settleCombobox()

      expect(input.attributes('aria-expanded')).toBe('true')
      expect(input.attributes('aria-controls')).toBe(content.attributes('id'))
      expect(content.attributes('role')).toBe('listbox')
      expect(viewport.attributes('role')).toBe('presentation')
      expect(selected.attributes('role')).toBe('option')
      expect(selected.attributes('aria-selected')).toBe('true')
      expect(disabled.attributes('data-disabled')).toBe('')
      expect(disabled.attributes('disabled')).toBe('')

      await disabled.trigger('click')
      await settleCombobox()
      expect(disabled.attributes('aria-selected')).toBe('false')
    } finally {
      wrapper.unmount()
    }
  })

  test('uses Reka keyboard highlight, edge, selection, and nearest-scroll behavior', async () => {
    const wrapper = await mountSuspended(
      createComboboxHarness({
        rootProps: { defaultValue: 'alpha', open: true },
      }),
      { attachTo: document.body },
    )

    try {
      await settleCombobox()
      const input = wrapper.get('input')
      const alpha = wrapper.get('[data-value="alpha"]')
      const beta = wrapper.get('[data-value="beta"]')
      const betaScroll = vi.fn()
      beta.element.scrollIntoView = betaScroll

      expect(alpha.attributes('data-highlighted')).toBe('')

      await input.trigger('keydown', { key: 'ArrowUp' })
      expect(alpha.attributes('data-highlighted')).toBe('')

      await input.trigger('keydown', { key: 'ArrowDown' })
      expect(beta.attributes('data-highlighted')).toBe('')
      expect(betaScroll).toHaveBeenCalledWith({ block: 'nearest' })

      await input.trigger('keydown', { key: 'ArrowDown' })
      expect(beta.attributes('data-highlighted')).toBe('')

      await input.trigger('keydown', { key: 'Enter' })
      await settleCombobox()

      expect(
        wrapper.findComponent(UiComboboxRootTest).emitted('update:modelValue'),
      ).toBeTruthy()
      expect(beta.attributes('aria-selected')).toBe('true')
    } finally {
      wrapper.unmount()
    }
  })

  test('does not navigate or select while an IME composition is active', async () => {
    const wrapper = await mountSuspended(
      createComboboxHarness({
        rootProps: { defaultValue: 'alpha', open: true },
      }),
    )

    try {
      await settleCombobox()
      const root = wrapper.findComponent(UiComboboxRootTest)
      const input = wrapper.get('input')
      const alpha = wrapper.get('[data-value="alpha"]')
      const beta = wrapper.get('[data-value="beta"]')

      await input.trigger('compositionstart')
      await input.trigger('keydown', { isComposing: true, key: 'ArrowDown' })
      await input.trigger('keydown', { isComposing: true, key: 'Enter' })

      expect(alpha.attributes('data-highlighted')).toBe('')
      expect(beta.attributes('data-highlighted')).toBeUndefined()
      expect(root.emitted('update:modelValue')).toBeUndefined()

      await input.trigger('compositionend')
    } finally {
      wrapper.unmount()
    }
  })

  test('uses pointer highlight, skips disabled keyboard items, and forwards highlight', async () => {
    const wrapper = await mountSuspended(
      createComboboxHarness({
        rootProps: { defaultValue: 'alpha', open: true },
      }),
    )

    try {
      await settleCombobox()
      const root = wrapper.findComponent(UiComboboxRootTest)
      const input = wrapper.get('input')
      const beta = wrapper.get('[data-value="beta"]')
      const disabled = wrapper.get('[data-value="disabled"]')

      await beta.trigger('pointermove')
      expect(beta.attributes('data-highlighted')).toBe('')
      expect(root.emitted('highlight')?.at(-1)?.[0]).toMatchObject({
        value: 'beta',
      })

      await input.trigger('keydown', { key: 'ArrowDown' })
      expect(beta.attributes('data-highlighted')).toBe('')
      expect(disabled.attributes('data-highlighted')).toBeUndefined()
    } finally {
      wrapper.unmount()
    }
  })

  test('allows item select prevention without changing model or open state', async () => {
    const onSelect = vi.fn((event: Event) => event.preventDefault())
    const Harness = defineComponent({
      setup() {
        return () =>
          h(
            UiComboboxRootTest,
            { defaultOpen: true, defaultValue: 'alpha' },
            {
              default: () => [
                h(UiComboboxInput, { 'aria-label': 'Search' }),
                h(
                  UiComboboxContent,
                  { forceMount: true },
                  {
                    default: () =>
                      h(
                        UiComboboxViewport,
                        {},
                        {
                          default: () => [
                            h(
                              UiComboboxItem,
                              { value: 'alpha' },
                              { default: () => 'Alpha' },
                            ),
                            h(
                              UiComboboxItem,
                              { onSelect, value: 'beta' },
                              { default: () => 'Beta' },
                            ),
                          ],
                        },
                      ),
                  },
                ),
              ],
            },
          )
      },
    })
    const wrapper = await mountSuspended(Harness, {
      attachTo: document.body,
    })

    try {
      await settleCombobox()
      const root = wrapper.findComponent(UiComboboxRootTest)
      await wrapper.get('[role="option"]:nth-of-type(2)').trigger('click')
      await settleCombobox()

      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(root.emitted('update:modelValue')).toBeUndefined()
      expect(wrapper.get('input').attributes('aria-expanded')).toBe('true')
    } finally {
      wrapper.unmount()
    }
  })

  test('keeps external results with ignoreFilter and preserves Reka filtering and Empty', async () => {
    const external = await mountSuspended(
      createComboboxHarness({ rootProps: { ignoreFilter: true, open: true } }),
    )

    try {
      const input = external.get('input')
      await input.setValue('not-present')
      await settleCombobox()

      expect(external.findAll('[role="option"]')).toHaveLength(3)
      expect(external.find('[data-testid="combobox-empty"]').exists()).toBe(
        false,
      )
    } finally {
      external.unmount()
    }

    const filtered = await mountSuspended(
      createComboboxHarness({ rootProps: { ignoreFilter: false, open: true } }),
    )

    try {
      const input = filtered.get('input')
      await input.setValue('Beta')
      await settleCombobox()

      expect(filtered.findAll('[role="option"]')).toHaveLength(1)
      expect(filtered.get('[role="option"]').text()).toBe('Beta')

      await input.setValue('not-present')
      await settleCombobox()
      expect(filtered.findAll('[role="option"]')).toHaveLength(0)
      expect(filtered.get('[data-testid="combobox-empty"]').text()).toBe(
        'No matching options',
      )
    } finally {
      filtered.unmount()
    }

    const empty = await mountSuspended(
      createComboboxHarness({ items: [], rootProps: { ignoreFilter: true } }),
    )

    try {
      await settleCombobox()
      expect(empty.get('[data-testid="combobox-empty"]').text()).toBe(
        'No matching options',
      )
    } finally {
      empty.unmount()
    }
  })

  test('preserves asChild DOM, attrs, classes, native events, and public data hooks', async () => {
    const onClick = vi.fn()
    const Harness = defineComponent({
      setup() {
        return () =>
          h(
            UiComboboxRootTest,
            { defaultOpen: true },
            {
              default: () => [
                h(UiComboboxInput, { 'aria-label': 'Search' }),
                h(
                  UiComboboxContent,
                  { forceMount: true },
                  {
                    default: () =>
                      h(
                        UiComboboxViewport,
                        {},
                        {
                          default: () =>
                            h(
                              UiComboboxItem,
                              {
                                asChild: true,
                                class: 'consumer-item',
                                'data-consumer': 'item',
                                onClick: onClick,
                                value: 'docs',
                              },
                              {
                                default: () =>
                                  h(
                                    'a',
                                    { href: '#docs', title: 'Open docs' },
                                    'Docs',
                                  ),
                              },
                            ),
                        },
                      ),
                  },
                ),
              ],
            },
          )
      },
    })
    const wrapper = await mountSuspended(Harness)

    try {
      await settleCombobox()
      const item = wrapper.get('a[data-consumer="item"]')

      expect(item.attributes('href')).toBe('#docs')
      expect(item.attributes('title')).toBe('Open docs')
      expect(item.attributes('role')).toBe('option')
      expect(item.classes()).toEqual(
        expect.arrayContaining(['ui-combobox-item', 'consumer-item']),
      )
      expect(item.attributes('data-state')).toBe('unchecked')

      await item.trigger('pointermove')
      expect(item.attributes('data-highlighted')).toBe('')

      await item.trigger('click')
      expect(onClick).toHaveBeenCalled()

      const cssSource = await readFile(
        resolve(process.cwd(), 'app/assets/css/ui.css'),
        'utf8',
      )
      expect(cssSource).toContain('.ui-combobox-item[data-highlighted]')
      expect(cssSource).toContain(".ui-combobox-item[data-state='checked']")
      expect(cssSource).toContain('.ui-combobox-item[data-disabled]')
      expect(cssSource).toContain('var(--docs-color-accent)')
      expect(cssSource).toContain('pointer-events: none')
    } finally {
      wrapper.unmount()
    }
  })

  test('renders safely through SSR without wrapper-owned browser globals or private contexts', async () => {
    const Harness = createComboboxHarness({
      rootProps: { defaultOpen: true, ignoreFilter: true },
    })
    const html = await renderToString(createSSRApp(Harness))
    const componentSources = await Promise.all(
      [
        'UiComboboxRoot.vue',
        'UiComboboxInput.vue',
        'UiComboboxContent.vue',
        'UiComboboxViewport.vue',
        'UiComboboxItem.vue',
        'UiComboboxEmpty.vue',
      ].map((file) =>
        readFile(resolve(process.cwd(), 'app/components/ui', file), 'utf8'),
      ),
    )

    expect(html).toContain('role="combobox"')
    expect(html).toContain('role="listbox"')
    expect(html).toContain('role="option"')

    for (const source of componentSources) {
      expect(source).not.toMatch(
        /\b(window|document|localStorage|sessionStorage)\b/,
      )
      expect(source).not.toContain('injectCombobox')
      expect(source).not.toContain('activeIndex')
    }

    const itemSource = componentSources[4]
    expect(itemSource).not.toMatch(/active\??:/)
  })
})
