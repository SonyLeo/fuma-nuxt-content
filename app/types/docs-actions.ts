export type DocsPageActionType = 'link' | 'button'

export type DocsPageActionState = 'idle' | 'loading' | 'success' | 'failed'

export type DocsPageActionIcon =
  | 'github'
  | 'source'
  | 'edit'
  | 'copy'
  | 'external'

export type DocsPageAction = {
  id: string
  type: DocsPageActionType
  label: string
  href?: string
  external?: boolean
  icon?: DocsPageActionIcon
  ariaLabel?: string
  disabled?: boolean
  hidden?: boolean
  state?: DocsPageActionState
}
