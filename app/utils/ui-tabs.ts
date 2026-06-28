import type { ComputedRef, InjectionKey } from 'vue'

export type UiTabsContext = {
  value: ComputedRef<string>
  baseId: string
  updateAnchor: ComputedRef<boolean>
  setValue: (value: string) => void
  registerContent: (value: string, id: string) => void
}

export const uiTabsKey: InjectionKey<UiTabsContext> = Symbol('ui-tabs')
