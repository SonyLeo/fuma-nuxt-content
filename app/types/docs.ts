export type DocsTocItem = {
  id: string
  text: string
  depth: number
}

export type DocsNode = {
  title: string
  path?: string
  stem?: string
  description?: string
  sectionLabel?: string
  order?: number
  hidden?: boolean
  badge?: string
  children: DocsNode[]
}
