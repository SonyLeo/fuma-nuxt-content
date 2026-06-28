import type { ComputedRef, InjectionKey, ShallowRef } from 'vue'

export type UiDialogContext = {
  open: ComputedRef<boolean>
  contentId: ComputedRef<string>
  titleId: ComputedRef<string>
  contentRef: ShallowRef<HTMLElement | null>
  setOpen: (open: boolean) => void
  close: () => void
}

export const uiDialogKey: InjectionKey<UiDialogContext> = Symbol('ui-dialog')
