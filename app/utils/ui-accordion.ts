import type { ComputedRef, InjectionKey } from 'vue'

export type UiAccordionType = 'single' | 'multiple'

export type UiAccordionContext = {
  type: ComputedRef<UiAccordionType>
  collapsible: ComputedRef<boolean>
  isOpen: (value: string) => boolean
  open: (value: string) => void
  close: (value: string) => void
  toggle: (value: string) => void
}

export type UiAccordionItemContext = {
  value: ComputedRef<string>
  open: ComputedRef<boolean>
  rekaEnabled: ComputedRef<boolean>
  triggerId: ComputedRef<string>
  contentId: ComputedRef<string>
  toggle: () => void
}

export const uiAccordionKey: InjectionKey<UiAccordionContext> =
  Symbol('ui-accordion')

export const uiAccordionItemKey: InjectionKey<UiAccordionItemContext> =
  Symbol('ui-accordion-item')
