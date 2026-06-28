import type { ComputedRef, InjectionKey } from 'vue'

export const docTabsValueKey: InjectionKey<ComputedRef<string>> =
  Symbol('doc-tabs-value')

export const docTabsSetterKey: InjectionKey<(value: string) => void> =
  Symbol('doc-tabs-setter')

export const docTabsIdKey: InjectionKey<string> = Symbol('doc-tabs-id')
