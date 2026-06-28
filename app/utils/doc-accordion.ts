import type { InjectionKey } from 'vue'

export type DocAccordionType = 'multiple' | 'single'

export type DocAccordionContext = {
  isOpen: (value: string) => boolean
  open: (value: string) => void
  close: (value: string) => void
  toggle: (value: string) => void
}

export const docAccordionKey: InjectionKey<DocAccordionContext> =
  Symbol('doc-accordion')

export function readBooleanLike(
  value: boolean | 'true' | 'false' | undefined,
  fallback = false,
) {
  if (typeof value === 'string') {
    return value === 'true'
  }

  if (typeof value === 'boolean') {
    return value
  }

  return fallback
}

export function normalizeAccordionType(value?: string): DocAccordionType {
  return value === 'single' ? 'single' : 'multiple'
}

export function normalizeAccordionValues(
  type: DocAccordionType,
  value?: string | string[],
) {
  const values = Array.isArray(value)
    ? value.map((item) => item.trim()).filter(Boolean)
    : typeof value === 'string'
      ? value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : []

  if (type === 'single') {
    return values.slice(0, 1)
  }

  return values
}

export function resolveAccordionValue(
  title: string,
  value?: string,
  id?: string,
) {
  const explicitValue = value?.trim()
  if (explicitValue) {
    return explicitValue
  }

  const explicitId = id?.trim()
  if (explicitId) {
    return explicitId
  }

  const fallback = title.trim()
  return fallback.length > 0 ? fallback : 'accordion-item'
}
