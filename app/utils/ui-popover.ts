import type { ComputedRef, InjectionKey, ShallowRef } from 'vue'

export type UiPopoverAlign = 'start' | 'center' | 'end'

export type UiPopoverContext = {
  open: ComputedRef<boolean>
  contentId: ComputedRef<string>
  triggerRef: ShallowRef<HTMLElement | null>
  contentRef: ShallowRef<HTMLElement | null>
  align: ComputedRef<UiPopoverAlign>
  sideOffset: ComputedRef<number>
  setOpen: (open: boolean) => void
  toggle: () => void
  close: () => void
}

export const uiPopoverKey: InjectionKey<UiPopoverContext> =
  Symbol('ui-popover')
