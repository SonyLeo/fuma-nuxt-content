import type {
  DocsDirectoryMetadata,
  DocsMetaPageEntry as DocsIngestionMetaPageEntry,
  DocsPageMetadata,
} from '../../shared/docs-metadata'

export type DocsTocItem = {
  id: string
  text: string
  depth: number
}

export type DocsTocItemState = {
  id: string
  item: DocsTocItem
  active: boolean
  fallback: boolean
  updatedAt: number
}

export type DocsLayoutTocOptions = {
  items?: DocsTocItem[]
  enabled?: boolean
  popover?: boolean
}

export type DocsNodeType = 'page' | 'group' | 'separator' | 'link'

export type DocsBreadcrumbRootOption =
  | boolean
  | {
      path?: string
      title?: string
    }

export type DocsBreadcrumbOptions = {
  includeRoot?: DocsBreadcrumbRootOption
  includePage?: boolean
  includeSeparator?: boolean
}

export type DocsMetaPageEntry = DocsIngestionMetaPageEntry

export type DocsDirectoryMeta = DocsDirectoryMetadata

export type DocsPageMeta = DocsPageMetadata

export type DocsPageLike = DocsPageMeta & {
  path?: string
  stem?: string
}

export type DocsTocTreeItem = {
  id: string
  text: string
  depth: number
  children?: DocsTocTreeItem[]
}

export type DocsStructuredData = {
  headings: Array<{
    id: string
    content: string
  }>
  contents: Array<{
    heading?: string
    content: string
  }>
}

export type DocsContentPage = DocsPageLike & {
  docsMetadata: DocsPageMeta
  structuredData?: DocsStructuredData
  body?: {
    toc?: {
      links?: DocsTocTreeItem[]
    }
  }
}

export type DocsPageRecord = {
  path: string
  stem?: string
  docsMetadata: DocsPageMeta
}

export type DocsPageIdentity = {
  contentPath: string
  sourcePath: string
  routePath: string
  stem?: string
  slug?: string
}

export type DocsPageTreePageInput = {
  identity: DocsPageIdentity
  metadata: DocsPageMeta
  publishable: true
}

export type DocsNode = {
  id: string
  type: DocsNodeType
  title: string
  path?: string
  sourcePath?: string
  href?: string
  external?: boolean
  stem?: string
  dirname?: string
  parentPath?: string
  rootPath?: string
  level: number
  description?: string
  sectionLabel?: string
  order?: number
  hidden?: boolean
  badge?: string
  icon?: string
  status?: string
  root?: boolean
  defaultOpen?: boolean
  collapsible?: boolean
  full?: boolean
  toc?: boolean
  tocPopover?: boolean
  pager?: boolean
  breadcrumb?: boolean
  breadcrumbRoot?: DocsBreadcrumbRootOption
  breadcrumbPage?: boolean
  breadcrumbSeparator?: boolean
  index?: DocsNode
  children: DocsNode[]
}

export type DocsBreadcrumbItem = {
  id: string
  type: Extract<DocsNodeType, 'page' | 'group' | 'separator'>
  title: string
  path?: string
}

export type DocsNavLinkActiveMode = 'url' | 'nested-url' | 'none'

export type DocsNavLinkPlacement = 'nav' | 'menu' | 'all'

export type DocsNavLinkType = 'main' | 'icon' | 'button' | 'menu' | 'custom'

export type DocsNavLink = {
  type?: DocsNavLinkType
  title: string
  href?: string
  description?: string
  icon?: string
  external?: boolean
  active?: DocsNavLinkActiveMode
  on?: DocsNavLinkPlacement
  ariaLabel?: string
  items?: DocsNavLink[]
}

export type DocsNavOptions = {
  title?: string
  enabled?: boolean
  tabs?: DocsNavLink[]
  tabMode?: DocsLayoutTabMode
}

export type DocsLayoutTabMode = 'auto' | 'sidebar' | 'top' | 'none'

export type DocsLayoutTab = DocsNavLink & {
  href: string
}

export type DocsBrandOptions = {
  label?: string
  mark?: string
  href?: string
}

export type DocsLayoutProps = {
  title?: string
  headline?: string
  brand?: DocsBrandOptions
  navigation?: DocsNode[]
  currentPath?: string
  githubUrl?: string
  links?: DocsNavLink[]
  nav?: DocsNavOptions
}

export type DocsDirection = 'ltr' | 'rtl'

export type DocsRootSearchOptions = {
  enabled?: boolean
}

export type DocsRootLanguageOptions = {
  enabled?: boolean
  label?: string
}

export type DocsTocProps = {
  items?: DocsTocItem[]
  activeId?: string
  activeIds?: readonly string[]
  activeItem?: DocsTocItem
  activeItems?: readonly DocsTocItem[]
  itemStates?: readonly DocsTocItemState[]
  progress?: number
  label?: string
}

export type DocsTocPopoverProps = {
  items?: DocsTocItem[]
  activeId?: string
  activeIds?: readonly string[]
  activeItem?: DocsTocItem
  activeItems?: readonly DocsTocItem[]
  itemStates?: readonly DocsTocItemState[]
  progress?: number
  activeLabel?: string
}

export type DocsPageHeaderProps = {
  title: string
  description?: string
  sectionLabel?: string
  breadcrumbs?: DocsBreadcrumbItem[]
}

export type DocsPageHeaderOptions = DocsPageHeaderProps & {
  enabled?: boolean
}

export type DocsPageTocOptions = {
  items?: DocsTocItem[]
  enabled?: boolean
  popover?: boolean
  label?: string
  activeLabel?: string
}

export type DocsResolvedPageTocOptions = {
  items: DocsTocItem[]
  enabled: boolean
  popover: boolean
  label: string
  activeLabel: string
}

export type DocsPageBreadcrumbProps = DocsBreadcrumbOptions & {
  items?: DocsBreadcrumbItem[]
  enabled?: boolean
}

export type DocsResolvedPageBreadcrumbProps = {
  items: DocsBreadcrumbItem[]
  enabled: boolean
  includeRoot: DocsBreadcrumbRootOption
  includePage: boolean
  includeSeparator: boolean
}

export type DocsPagerItem = Pick<
  DocsNode,
  'id' | 'title' | 'path' | 'description'
>

export type DocsHomepageNavigationItem = Pick<
  DocsNode,
  'id' | 'title' | 'description' | 'badge'
> & {
  path: string
}

export type DocsHomepageNavigation = {
  sections: DocsHomepageNavigationItem[]
  featured: DocsHomepageNavigationItem[]
}

export type DocsPagerLabels = {
  previous?: string
  next?: string
  previousDescription?: string
  nextDescription?: string
}

export type DocsPageFooterProps = {
  enabled?: boolean
  previous?: DocsPagerItem | null
  next?: DocsPagerItem | null
  pagerLabels?: DocsPagerLabels
}

export type DocsResolvedPageFooterProps = {
  enabled: boolean
}

export type DocsPageProps = {
  full?: boolean
  header?: DocsPageHeaderOptions
  toc?: DocsPageTocOptions
  breadcrumb?: DocsPageBreadcrumbProps
  footer?: DocsPageFooterProps
}

export type DocsResolvedPageOptions = {
  full: boolean
  toc: DocsResolvedPageTocOptions
  breadcrumb: DocsResolvedPageBreadcrumbProps
  footer: DocsResolvedPageFooterProps
}
