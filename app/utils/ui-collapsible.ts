import type { ComputedRef, InjectionKey } from 'vue'

export type UiCollapsibleContext = {
  open: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
  contentId: ComputedRef<string>
  setOpen: (open: boolean) => void
  toggle: () => void
}

export const uiCollapsibleKey: InjectionKey<UiCollapsibleContext> =
  Symbol('ui-collapsible')
