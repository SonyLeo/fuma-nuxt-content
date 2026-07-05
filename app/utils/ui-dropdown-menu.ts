import type { ComputedRef, InjectionKey, ShallowRef } from 'vue'

export type UiDropdownMenuAlign = 'start' | 'center' | 'end'
export type UiDropdownMenuSide = 'top' | 'right' | 'bottom' | 'left'

export type UiDropdownMenuContext = {
  open: ComputedRef<boolean>
  contentId: ComputedRef<string>
  triggerRef: ShallowRef<HTMLElement | null>
  contentRef: ShallowRef<HTMLElement | null>
  align: ComputedRef<UiDropdownMenuAlign>
  side: ComputedRef<UiDropdownMenuSide>
  sideOffset: ComputedRef<number>
  setOpen: (open: boolean) => void
  close: () => void
  toggle: () => void
}

export const uiDropdownMenuKey: InjectionKey<UiDropdownMenuContext> = Symbol(
  'ui-dropdown-menu',
)
