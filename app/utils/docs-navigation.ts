import type { ContentNavigationItem } from '@nuxt/content'
import type {
  DocsBreadcrumbItem,
  DocsBreadcrumbOptions,
  DocsBreadcrumbRootOption,
  DocsDirectoryMeta,
  DocsMetaPageEntry,
  DocsNode,
  DocsPageMeta,
} from '~/types/docs'

export const docsNavigationFields = [
  'description',
  'sectionLabel',
  'slug',
  'order',
  'hidden',
  'badge',
  'icon',
  'status',
  'defaultOpen',
  'collapsible',
  'full',
  'toc',
  'tocPopover',
  'pager',
  'breadcrumb',
  'breadcrumbRoot',
  'breadcrumbPage',
  'breadcrumbSeparator',
] as const

type DocsTreeOptions = {
  navigation: ContentNavigationItem[] | null | undefined
  pageMetaByPath?: Map<string, DocsPageMeta>
  directoryMetaByStem?: Map<string, DocsDirectoryMeta>
  preserveExcluded?: boolean
  includeHidden?: boolean
}

type RootContext = {
  rootPath?: string
  rootLabel?: string
}

type DocsRouteRecord = {
  path: string
  stem?: string
  slug?: string
}

type DocsPathSegments = string[]

function readString(item: ContentNavigationItem, key: string) {
  const value = item[key]
  return typeof value === 'string' ? value : undefined
}

function readNumber(item: ContentNavigationItem, key: string) {
  const value = item[key]
  return typeof value === 'number' ? value : undefined
}

function readBoolean(item: ContentNavigationItem, key: string) {
  const value = item[key]
  return typeof value === 'boolean' ? value : undefined
}

function readBreadcrumbRoot(
  item: ContentNavigationItem,
  key: string,
): DocsBreadcrumbRootOption | undefined {
  const value = item[key]

  if (typeof value === 'boolean') {
    return value
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const path =
    'path' in value && typeof value.path === 'string' ? value.path : undefined
  const title =
    'title' in value && typeof value.title === 'string'
      ? value.title
      : undefined

  if (!path && !title) {
    return undefined
  }

  return {
    path,
    title,
  }
}

function normalizeStem(value?: string) {
  if (!value) {
    return ''
  }

  return value.replace(/\/index$/, '')
}

function normalizeName(value?: string) {
  return value?.replace(/^\d+\./, '') ?? ''
}

function isSeparatorString(value: string) {
  return /^---.*---$/.test(value)
}

function parseSeparatorString(value: string) {
  const match = /^---(?:\[(?<icon>[^\]]+)])?(?<title>.*)---$/.exec(value)
  if (!match) {
    return null
  }

  const title = match.groups?.title?.trim() ?? ''
  return {
    type: 'separator' as const,
    title,
    icon: match.groups?.icon,
  }
}

function isRestString(value: string) {
  return value === '...' || value === 'z...a' || value.startsWith('...')
}

function parseRestTarget(value: string) {
  if (value === '...') {
    return null
  }

  return normalizeName(value.slice(3))
}

function isReversedRestString(value: string) {
  return value === 'z...a'
}

function isExcludeString(value: string) {
  return value.startsWith('!')
}

function parseExcludeTarget(value: string) {
  return normalizeName(value.slice(1))
}

function isLinkString(value: string) {
  return /^(external:)?(?:\[[^\]]+])?\[[^\]]+]\(([^)]+)\)$/.test(value)
}

function parseLinkString(value: string) {
  const match =
    /^(?<external>external:)?(?:\[(?<icon>[^\]]+)])?\[(?<title>[^\]]+)]\((?<href>[^)]+)\)$/.exec(
      value,
    )

  if (!match?.groups?.title || !match.groups.href) {
    return null
  }

  return {
    type: 'link' as const,
    title: match.groups.title,
    href: match.groups.href,
    external: Boolean(match.groups.external),
    icon: match.groups.icon,
  }
}

function getPathSegments(path?: string) {
  if (!path || path === '/') {
    return []
  }

  return path.replace(/^\//, '').split('/')
}

function decodeRouteSegment(segment: string) {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

function encodeRouteSegment(segment: string) {
  return encodeURI(segment)
}

function normalizeRouteSegments(segments: DocsPathSegments) {
  return segments
    .map((segment) => decodeRouteSegment(segment.trim()))
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeRouteSegment(segment))
}

export function normalizeDocsSourcePath(path?: string) {
  if (!path) {
    return '/'
  }

  const normalized = path
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/index$/, '')

  return normalized ? `/${normalized}` : '/'
}

export function resolveDocsRecordSourcePath(
  record: Pick<DocsRouteRecord, 'path' | 'stem'>,
) {
  return normalizeDocsSourcePath(record.stem || record.path)
}

function createDocsNodeId(parts: Array<string | number | undefined>) {
  return parts
    .filter((part) => part !== undefined && String(part).length > 0)
    .join(':')
}

export function normalizeDocsRoutePath(path?: string) {
  if (!path) {
    return '/'
  }

  const normalized = (path.startsWith('/') ? path : `/${path}`).replace(
    /\/+/g,
    '/',
  )
  const normalizedSegments = normalizeRouteSegments(getPathSegments(normalized))

  if (normalizedSegments.length === 0) {
    return normalized
  }

  return `/${normalizedSegments.join('/')}`
}

export function resolveDocsRoutePath(
  sourcePath: string,
  pageMeta?: Pick<DocsPageMeta, 'slug'>,
) {
  const normalizedSourcePath = normalizeDocsRoutePath(sourcePath)
  const slug = pageMeta?.slug?.trim()

  if (!slug) {
    return normalizedSourcePath
  }

  if (slug.startsWith('/')) {
    return normalizeDocsRoutePath(slug)
  }

  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '')

  if (!normalizedSlug) {
    return normalizedSourcePath
  }

  const baseDir = getDirnameFromPath(normalizedSourcePath)
  const normalizedSlugPath = normalizeDocsRoutePath(normalizedSlug)

  return normalizeDocsRoutePath(
    `/${[baseDir, normalizedSlugPath.replace(/^\//, '')].filter(Boolean).join('/')}`,
  )
}

function getLevel(path?: string) {
  return getPathSegments(path).length
}

function getParentPath(path?: string) {
  const segments = getPathSegments(path)
  if (segments.length <= 1) {
    return undefined
  }

  return `/${segments.slice(0, -1).join('/')}`
}

function getDirnameFromPath(path?: string) {
  if (!path || path === '/') {
    return ''
  }

  const segments = getPathSegments(path)
  return segments.slice(0, -1).join('/')
}

function getNodeSortKey(node: DocsNode) {
  if (node.type === 'separator') {
    return `separator:${node.title}`
  }

  if (node.type === 'link') {
    return `link:${node.href ?? node.title}`
  }

  return normalizeName(node.stem ?? node.sourcePath ?? node.path ?? node.title)
}

function getMetaEntryKey(node: DocsNode) {
  if (node.type === 'link') {
    return normalizeName(node.href ?? node.title)
  }

  if (node.type === 'separator') {
    return normalizeName(node.title)
  }

  if (node.type === 'group') {
    const dirname = getPathSegments(node.dirname).at(-1)

    if (dirname) {
      return normalizeName(dirname)
    }
  }

  const sourcePath = node.sourcePath ?? node.path

  return getPathSegments(sourcePath).at(-1)
    ? normalizeName(getPathSegments(sourcePath).at(-1))
    : normalizeName(node.stem ?? node.title)
}

function compareOrder(left?: number, right?: number) {
  if (left === undefined && right === undefined) {
    return 0
  }

  if (left === undefined) {
    return 1
  }

  if (right === undefined) {
    return -1
  }

  return left - right
}

function compareNodes(left: DocsNode, right: DocsNode) {
  return (
    compareOrder(left.order, right.order) ||
    getNodeSortKey(left).localeCompare(getNodeSortKey(right), 'en')
  )
}

function applyPageMeta(
  item: ContentNavigationItem,
  fallback: DocsPageMeta | undefined,
): DocsPageMeta {
  return {
    title: item.title || fallback?.title,
    description: readString(item, 'description') ?? fallback?.description,
    sectionLabel: readString(item, 'sectionLabel') ?? fallback?.sectionLabel,
    slug: readString(item, 'slug') ?? fallback?.slug,
    order: readNumber(item, 'order') ?? fallback?.order,
    hidden: readBoolean(item, 'hidden') ?? fallback?.hidden,
    badge: readString(item, 'badge') ?? fallback?.badge,
    icon: readString(item, 'icon') ?? fallback?.icon,
    status: readString(item, 'status') ?? fallback?.status,
    defaultOpen: readBoolean(item, 'defaultOpen') ?? fallback?.defaultOpen,
    collapsible: readBoolean(item, 'collapsible') ?? fallback?.collapsible,
    full: readBoolean(item, 'full') ?? fallback?.full,
    toc: readBoolean(item, 'toc') ?? fallback?.toc,
    tocPopover: readBoolean(item, 'tocPopover') ?? fallback?.tocPopover,
    pager: readBoolean(item, 'pager') ?? fallback?.pager,
    breadcrumb: readBoolean(item, 'breadcrumb') ?? fallback?.breadcrumb,
    breadcrumbRoot:
      readBreadcrumbRoot(item, 'breadcrumbRoot') ?? fallback?.breadcrumbRoot,
    breadcrumbPage:
      readBoolean(item, 'breadcrumbPage') ?? fallback?.breadcrumbPage,
    breadcrumbSeparator:
      readBoolean(item, 'breadcrumbSeparator') ?? fallback?.breadcrumbSeparator,
  }
}

function cloneNode(node: DocsNode): DocsNode {
  return {
    ...node,
    index: node.index ? cloneNode(node.index) : undefined,
    children: node.children.map(cloneNode),
  }
}

function decorateNode(
  node: DocsNode,
  patch: Partial<DocsNode>,
  overrides?: {
    index?: Partial<DocsNode> | null
  },
) {
  return {
    ...node,
    ...patch,
    index:
      overrides?.index === null
        ? undefined
        : node.index
          ? {
              ...node.index,
              id: node.index.id,
              ...(overrides?.index ?? {}),
            }
          : undefined,
  }
}

function createNodeFromNavigation(
  item: ContentNavigationItem,
  pageMetaByPath: Map<string, DocsPageMeta>,
  directoryMetaByStem: Map<string, DocsDirectoryMeta>,
): DocsNode {
  const sourcePath = item.stem
    ? normalizeDocsSourcePath(item.stem)
    : item.path
      ? normalizeDocsSourcePath(item.path)
      : undefined
  const stem = item.stem
  const pageMeta = sourcePath ? pageMetaByPath.get(sourcePath) : undefined
  const mergedMeta = applyPageMeta(item, pageMeta)
  const path = sourcePath
    ? resolveDocsRoutePath(sourcePath, mergedMeta)
    : undefined
  const children = (item.children ?? []).map((child) =>
    createNodeFromNavigation(child, pageMetaByPath, directoryMetaByStem),
  )
  const normalizedStem = normalizeStem(stem)
  const isGroup = children.length > 0 || item.page === false
  const directoryMeta = isGroup
    ? (directoryMetaByStem.get(normalizeStem(getDirnameFromPath(sourcePath))) ??
      directoryMetaByStem.get(normalizedStem))
    : directoryMetaByStem.get(normalizedStem)

  const baseNode: DocsNode = {
    id: createDocsNodeId([
      isGroup ? 'group' : 'page',
      sourcePath ?? stem ?? path ?? mergedMeta.title ?? 'untitled',
    ]),
    type: isGroup ? 'group' : 'page',
    title: directoryMeta?.title ?? mergedMeta.title ?? 'Untitled',
    path,
    sourcePath,
    stem,
    dirname: getDirnameFromPath(sourcePath),
    parentPath: getParentPath(path),
    level: getLevel(path),
    description: directoryMeta?.description ?? mergedMeta.description,
    sectionLabel: mergedMeta.sectionLabel,
    order: directoryMeta?.order ?? mergedMeta.order,
    hidden: directoryMeta?.hidden ?? mergedMeta.hidden,
    badge: directoryMeta?.badge ?? mergedMeta.badge,
    icon: directoryMeta?.icon ?? mergedMeta.icon,
    status: mergedMeta.status,
    root: directoryMeta?.root,
    defaultOpen:
      directoryMeta?.defaultOpen ??
      mergedMeta.defaultOpen ??
      (directoryMeta?.collapsible === false ? true : undefined),
    collapsible: directoryMeta?.collapsible ?? mergedMeta.collapsible,
    full: mergedMeta.full,
    toc: mergedMeta.toc,
    tocPopover: mergedMeta.tocPopover,
    pager: mergedMeta.pager,
    breadcrumb: mergedMeta.breadcrumb,
    breadcrumbRoot: mergedMeta.breadcrumbRoot,
    breadcrumbPage: mergedMeta.breadcrumbPage,
    breadcrumbSeparator: mergedMeta.breadcrumbSeparator,
    children,
  }

  if (!isGroup) {
    return baseNode
  }

  const indexChild = children.find(
    (child) => child.path === path && child.type === 'page',
  )

  if (!indexChild) {
    return baseNode
  }

  return {
    ...baseNode,
    children: children.filter((child) => child !== indexChild),
    index: decorateNode(indexChild, {
      title: baseNode.title,
      description: baseNode.description ?? indexChild.description,
      badge: baseNode.badge ?? indexChild.badge,
      icon: baseNode.icon ?? indexChild.icon,
      root: baseNode.root,
      defaultOpen: baseNode.defaultOpen ?? indexChild.defaultOpen,
      collapsible: baseNode.collapsible ?? indexChild.collapsible,
    }),
  }
}

function createSeparatorNode(
  title: string,
  parent?: DocsNode,
  keySuffix?: string | number,
) {
  return {
    id: createDocsNodeId([
      'separator',
      parent?.sourcePath ?? parent?.path ?? parent?.title,
      title,
      keySuffix,
    ]),
    type: 'separator' as const,
    title,
    path: undefined,
    href: undefined,
    icon: undefined,
    stem: undefined,
    dirname: parent?.dirname,
    parentPath: parent?.path,
    level: (parent?.level ?? 0) + 1,
    rootPath: parent?.rootPath,
    children: [],
  } satisfies DocsNode
}

function createLinkNode(
  entry: Extract<DocsMetaPageEntry, { type: 'link' }>,
  parent?: DocsNode,
  keySuffix?: string | number,
) {
  return {
    id: createDocsNodeId([
      'link',
      parent?.sourcePath ?? parent?.path ?? parent?.title,
      entry.href,
      keySuffix,
    ]),
    type: 'link' as const,
    title: entry.title,
    href: entry.href,
    external: entry.external,
    badge: entry.badge,
    icon: entry.icon,
    dirname: parent?.dirname,
    parentPath: parent?.path,
    level: (parent?.level ?? 0) + 1,
    rootPath: parent?.rootPath,
    children: [],
  } satisfies DocsNode
}

function collectExtractedChildren(
  children: DocsNode[],
  name: string,
  consumed: Set<string>,
) {
  const extracted = children.filter((child) => {
    if (consumed.has(getNodeSortKey(child))) {
      return false
    }

    return (
      getMetaEntryKey(child) === name ||
      normalizeName(child.stem) === name ||
      normalizeName(child.dirname) === name
    )
  })

  for (const child of extracted) {
    consumed.add(getNodeSortKey(child))
  }

  return extracted
}

function collectMatchedChildren(children: DocsNode[], name: string) {
  return children.filter((child) => {
    return (
      getMetaEntryKey(child) === name ||
      normalizeName(child.stem) === name ||
      normalizeName(child.dirname) === name
    )
  })
}

function resolveMetaIndexNode(node: DocsNode, pagesIndex?: string) {
  if (!pagesIndex || node.type !== 'group') {
    return node
  }

  const key = normalizeName(pagesIndex)
  const candidates = node.index ? [node.index, ...node.children] : node.children
  const match = candidates.find((child) => {
    if (child.type === 'separator') {
      return false
    }

    return (
      getMetaEntryKey(child) === key ||
      normalizeName(child.stem) === key ||
      normalizeName(child.dirname) === key ||
      child.path === pagesIndex ||
      child.path === `/${pagesIndex.replace(/^\//, '')}`
    )
  })

  if (!match || match === node.index) {
    if (!match && isLinkString(pagesIndex)) {
      const link = parseLinkString(pagesIndex)
      if (link) {
        return {
          ...node,
          index: createLinkNode(link, node, 'index'),
        }
      }
    }

    return node
  }

  const nextIndex =
    match.type === 'group'
      ? decorateNode(match.index ?? match, {
          title: match.title,
          description: match.description,
          badge: match.badge,
          icon: match.icon,
          status: match.status,
          root: match.root,
          defaultOpen: match.defaultOpen,
          collapsible: match.collapsible,
          pager: match.pager,
          toc: match.toc,
          full: match.full,
        })
      : decorateNode(match, {
          title: match.title,
          description: match.description,
          badge: match.badge,
          icon: match.icon,
          status: match.status,
          root: match.root,
          defaultOpen: match.defaultOpen,
          collapsible: match.collapsible,
        })

  return {
    ...node,
    index: nextIndex,
    children: node.children.filter((child) => child !== match),
  }
}

function applyMetaEntryToNode(node: DocsNode, entry: DocsMetaPageEntry) {
  if (typeof entry === 'string') {
    return node
  }

  if (entry.type === 'separator' || entry.type === 'link') {
    return node
  }

  return decorateNode(
    node,
    {
      type: entry.type,
      title: entry.title ?? node.title,
      badge: entry.badge ?? node.badge,
      icon: entry.icon ?? node.icon,
      status: entry.status ?? node.status,
      hidden: entry.hidden ?? node.hidden,
      defaultOpen: entry.defaultOpen ?? node.defaultOpen,
      collapsible: entry.collapsible ?? node.collapsible,
    },
    entry.title || entry.badge || entry.icon
      ? {
          index: {
            title: entry.title ?? node.index?.title,
            badge: entry.badge ?? node.index?.badge,
            icon: entry.icon ?? node.index?.icon,
            status: entry.status ?? node.index?.status,
            hidden: entry.hidden ?? node.index?.hidden,
            defaultOpen: entry.defaultOpen ?? node.index?.defaultOpen,
            collapsible: entry.collapsible ?? node.index?.collapsible,
          },
        }
      : undefined,
  )
}

function reorderNodesByMeta(
  nodes: DocsNode[],
  directoryMetaByStem: Map<string, DocsDirectoryMeta>,
  options: Pick<DocsTreeOptions, 'preserveExcluded' | 'includeHidden'> = {},
): DocsNode[] {
  return nodes
    .map((node) => {
      const children = reorderNodesByMeta(
        node.children,
        directoryMetaByStem,
        options,
      )
      const nodeDirectoryStem =
        node.type === 'group'
          ? normalizeStem(
              getDirnameFromPath(node.sourcePath ?? node.path ?? node.stem),
            )
          : ''
      const meta =
        (nodeDirectoryStem
          ? directoryMetaByStem.get(nodeDirectoryStem)
          : undefined) ??
        (node.stem
          ? directoryMetaByStem.get(normalizeStem(node.stem))
          : undefined)

      const currentNode = resolveMetaIndexNode(
        {
          ...node,
          children,
        },
        meta?.pagesIndex,
      )

      if (!meta?.pages?.length) {
        return {
          ...currentNode,
          children: currentNode.children.toSorted(compareNodes),
        }
      }

      const orderedChildren: DocsNode[] = []
      const consumed = new Set<string>()

      for (const entry of meta.pages) {
        if (typeof entry === 'string') {
          if (isSeparatorString(entry)) {
            const separator = parseSeparatorString(entry)
            if (separator) {
              orderedChildren.push({
                ...createSeparatorNode(
                  separator.title,
                  currentNode,
                  orderedChildren.length,
                ),
                icon: separator.icon,
              })
            }
            continue
          }

          if (isLinkString(entry)) {
            const link = parseLinkString(entry)
            if (link) {
              orderedChildren.push(
                createLinkNode(link, currentNode, orderedChildren.length),
              )
            }
            continue
          }

          if (isExcludeString(entry)) {
            if (options.preserveExcluded) {
              continue
            }

            const target = parseExcludeTarget(entry)
            const matches = collectMatchedChildren(currentNode.children, target)
            for (const child of matches) {
              consumed.add(getNodeSortKey(child))
            }

            if (
              currentNode.index &&
              collectMatchedChildren([currentNode.index], target).length > 0
            ) {
              currentNode.index = undefined
            }
            continue
          }

          if (isRestString(entry)) {
            const reversed = isReversedRestString(entry)
            const rest = reversed
              ? currentNode.children
                  .filter((child) => !consumed.has(getNodeSortKey(child)))
                  .toSorted(compareNodes)
                  .reverse()
              : (() => {
                  const target = parseRestTarget(entry)
                  return target
                    ? collectExtractedChildren(
                        currentNode.children,
                        target,
                        consumed,
                      )
                    : currentNode.children.filter(
                        (child) => !consumed.has(getNodeSortKey(child)),
                      )
                })()

            orderedChildren.push(
              ...(reversed ? rest : rest.toSorted(compareNodes)),
            )
            for (const child of rest) {
              consumed.add(getNodeSortKey(child))
            }
            continue
          }

          const key = normalizeName(entry)
          const match = currentNode.children.find(
            (child) =>
              !consumed.has(getNodeSortKey(child)) &&
              getMetaEntryKey(child) === key,
          )
          if (match) {
            orderedChildren.push(match)
            consumed.add(getNodeSortKey(match))
          }
          continue
        }

        if (entry.type === 'separator') {
          orderedChildren.push({
            ...createSeparatorNode(
              entry.title,
              currentNode,
              orderedChildren.length,
            ),
            icon: entry.icon,
          })
          continue
        }

        if (entry.type === 'link') {
          orderedChildren.push(
            createLinkNode(entry, currentNode, orderedChildren.length),
          )
          continue
        }

        const key = normalizeName(entry.name)
        const match = currentNode.children.find(
          (child) =>
            !consumed.has(getNodeSortKey(child)) &&
            getMetaEntryKey(child) === key,
        )

        if (!match) {
          continue
        }

        orderedChildren.push(applyMetaEntryToNode(match, entry))
        consumed.add(getNodeSortKey(match))
      }

      const rest = currentNode.children
        .filter((child) => !consumed.has(getNodeSortKey(child)))
        .toSorted(compareNodes)

      return {
        ...currentNode,
        children: [...orderedChildren, ...rest],
      }
    })
    .filter((node) => options.includeHidden || !node.hidden)
    .toSorted(compareNodes)
}

function annotateTree(
  nodes: DocsNode[],
  parentPath?: string,
  levelOffset = 0,
  rootContext: RootContext = {},
  includeHidden = false,
): DocsNode[] {
  return nodes
    .map((node) => {
      const resolvedRootPath = node.root
        ? (node.path ?? node.index?.path)
        : rootContext.rootPath
      const nextRootContext = {
        rootPath: resolvedRootPath,
        rootLabel: node.root ? node.title : rootContext.rootLabel,
      }
      const path = node.path ?? node.index?.path
      const level = path ? getLevel(path) || levelOffset : levelOffset
      const nextParentPath = node.path ?? node.index?.path ?? parentPath
      const annotatedIndex = node.index
        ? {
            ...node.index,
            level,
            parentPath,
            rootPath: resolvedRootPath,
            children: [],
          }
        : undefined

      return {
        ...node,
        level,
        parentPath,
        rootPath: resolvedRootPath,
        index: annotatedIndex,
        children: annotateTree(
          node.children,
          nextParentPath,
          path ? level + 1 : levelOffset + 1,
          nextRootContext,
          includeHidden,
        ),
      }
    })
    .filter((node) => includeHidden || !node.hidden)
}

function flattenNode(node: DocsNode): DocsNode[] {
  const index = node.index ? [node.index] : []
  const current = node.type === 'page' && node.path ? [node] : []

  return [...index, ...current, ...node.children.flatMap(flattenNode)]
}

export function createDocsMetaMap(
  items:
    | Array<
        DocsPageMeta & {
          path: string
          stem?: string
        }
      >
    | null
    | undefined,
) {
  assertUniqueDocsRoutePaths(items)

  return new Map(
    (items ?? []).map((item) => [
      resolveDocsRecordSourcePath(item),
      {
        title: item.title,
        description: item.description,
        sectionLabel: item.sectionLabel,
        slug: item.slug,
        order: item.order,
        hidden: item.hidden,
        badge: item.badge,
        icon: item.icon,
        status: item.status,
        defaultOpen: item.defaultOpen,
        collapsible: item.collapsible,
        full: item.full,
        toc: item.toc,
        tocPopover: item.tocPopover,
        pager: item.pager,
        breadcrumb: item.breadcrumb,
        breadcrumbRoot: item.breadcrumbRoot,
        breadcrumbPage: item.breadcrumbPage,
        breadcrumbSeparator: item.breadcrumbSeparator,
      } satisfies DocsPageMeta,
    ]),
  )
}

export function assertUniqueDocsRoutePaths(
  items: DocsRouteRecord[] | null | undefined,
) {
  const routeToSources = new Map<string, string[]>()

  for (const item of items ?? []) {
    const routePath = resolveDocsRoutePath(resolveDocsRecordSourcePath(item), item)
    const sources = routeToSources.get(routePath) ?? []
    sources.push(item.path)
    routeToSources.set(routePath, sources)
  }

  const duplicates = Array.from(routeToSources.entries()).filter(
    ([, sources]) => sources.length > 1,
  )

  if (duplicates.length === 0) {
    return
  }

  const detail = duplicates
    .map(([routePath, sources]) => {
      return `${routePath}: ${sources.join(', ')}`
    })
    .join('; ')

  throw new Error(`Duplicate docs route paths detected: ${detail}`)
}

export function createDirectoryMetaMap(
  items:
    | Array<
        Omit<DocsDirectoryMeta, 'stem'> & {
          stem: string
        }
      >
    | null
    | undefined,
) {
  return new Map(
    (items ?? []).map((item) => [
      normalizeStem(item.stem.replace(/\/meta$/, '')),
      {
        stem: normalizeStem(item.stem.replace(/\/meta$/, '')),
        title: item.title,
        description: item.description,
        order: item.order,
        pages: item.pages,
        pagesIndex: item.pagesIndex,
        root: item.root,
        hidden: item.hidden,
        defaultOpen: item.defaultOpen,
        collapsible: item.collapsible,
        badge: item.badge,
        icon: item.icon,
      } satisfies DocsDirectoryMeta,
    ]),
  )
}

export function buildDocsTree(options: DocsTreeOptions): DocsNode[] {
  const pageMetaByPath =
    options.pageMetaByPath ?? new Map<string, DocsPageMeta>()
  const directoryMetaByStem =
    options.directoryMetaByStem ?? new Map<string, DocsDirectoryMeta>()

  const nodes = (options.navigation ?? []).map((item) =>
    createNodeFromNavigation(item, pageMetaByPath, directoryMetaByStem),
  )

  return annotateTree(
    reorderNodesByMeta(nodes, directoryMetaByStem, options),
    undefined,
    0,
    {},
    options.includeHidden,
  )
}

export function resolveDocsSourcePath(
  items:
    | Array<
        DocsPageMeta & {
          path: string
          stem?: string
        }
      >
    | null
    | undefined,
  routePath: string,
) {
  const normalizedRoutePath = normalizeDocsRoutePath(routePath)
  const match = (items ?? []).find((item) => {
    return (
      resolveDocsRoutePath(resolveDocsRecordSourcePath(item), item) ===
      normalizedRoutePath
    )
  })

  return match ? resolveDocsRecordSourcePath(match) : null
}

export function findDocsPageRecordByRoute<
  T extends DocsPageMeta & {
    path: string
    stem?: string
  },
>(items: T[] | null | undefined, routePath: string) {
  const normalizedRoutePath = normalizeDocsRoutePath(routePath)

  return (
    (items ?? []).find((item) => {
      return (
        resolveDocsRoutePath(resolveDocsRecordSourcePath(item), item) ===
          normalizedRoutePath ||
        normalizeDocsRoutePath(item.path) === normalizedRoutePath
      )
    }) ?? null
  )
}

export function flattenDocsNodes(items: DocsNode[]): DocsNode[] {
  return items.flatMap(flattenNode)
}

export function findDocsNodeByPath(
  items: DocsNode[],
  path: string,
): DocsNode | null {
  for (const item of items) {
    if (item.path === path || item.index?.path === path) {
      return item
    }

    if (item.children.length > 0) {
      const result = findDocsNodeByPath(item.children, path)
      if (result) {
        return result
      }
    }
  }

  return null
}

export function findDocsAncestors(items: DocsNode[], path: string): DocsNode[] {
  let pendingSeparator: DocsNode | null = null

  for (const item of items) {
    if (item.path === path || item.index?.path === path) {
      if (item.type === 'separator' || item.type === 'link') {
        return []
      }

      return pendingSeparator ? [pendingSeparator, item] : [item]
    }

    if (item.type === 'separator') {
      pendingSeparator = item
      continue
    }

    if (item.children.length > 0) {
      const trail = findDocsAncestors(item.children, path)
      if (trail.length > 0) {
        const baseTrail = item.type === 'link' ? trail : [item, ...trail]

        return pendingSeparator ? [pendingSeparator, ...baseTrail] : baseTrail
      }
    }
  }

  return []
}

function resolveBreadcrumbRootItem(
  rootNode: DocsNode | undefined,
  includeRoot: DocsBreadcrumbRootOption,
): DocsBreadcrumbItem | null {
  if (!includeRoot || !rootNode) {
    return null
  }

  const rootPath =
    typeof includeRoot === 'object'
      ? includeRoot.path
      : (rootNode.path ?? rootNode.index?.path)

  const rootTitle =
    typeof includeRoot === 'object'
      ? (includeRoot.title ?? rootNode.title)
      : rootNode.title

  return {
    id: createDocsNodeId([
      'breadcrumb-root',
      rootNode.id,
      typeof includeRoot === 'object' ? includeRoot.path : rootPath,
    ]),
    type: 'group',
    title: rootTitle,
    path: rootPath,
  }
}

export function createDocsBreadcrumbItems(
  items: DocsNode[],
  path: string,
  options: DocsBreadcrumbOptions = {},
) {
  const {
    includeRoot = false,
    includePage = false,
    includeSeparator = false,
  } = options
  const ancestors = findDocsAncestors(items, path)
  const rootIndex = ancestors.findLastIndex((item) => item.root)
  const rootNode = rootIndex >= 0 ? ancestors[rootIndex] : undefined
  const scopedAncestors =
    rootIndex >= 0 ? ancestors.slice(rootIndex) : ancestors
  const output: DocsBreadcrumbItem[] = []

  const rootItem = resolveBreadcrumbRootItem(rootNode, includeRoot)
  if (rootItem) {
    output.push(rootItem)
  }

  for (const item of scopedAncestors) {
    if (item.type === 'separator') {
      if (includeSeparator) {
        output.push({
          id: createDocsNodeId(['breadcrumb-separator', item.id]),
          type: 'separator',
          title: item.title,
        })
      }
      continue
    }

    if (item.type !== 'page' && item.type !== 'group') {
      continue
    }

    if (item.root) {
      continue
    }

    const itemPath = item.path ?? item.index?.path
    const isCurrent = itemPath === path || item.index?.path === path

    if (item.type === 'group') {
      const isCurrentIndexPage = item.index?.path === path

      if (isCurrentIndexPage) {
        if (includePage) {
          output.push({
            id: createDocsNodeId([
              'breadcrumb-page',
              item.index?.id ?? item.id,
            ]),
            type: 'page',
            title: item.index?.title ?? item.title,
            path: item.index?.path,
          })
        }
        continue
      }

      output.push({
        id: createDocsNodeId(['breadcrumb-group', item.id]),
        type: 'group',
        title: item.title,
        path: item.index?.path ?? item.path,
      })
      continue
    }

    if (item.type === 'page' && isCurrent && !includePage) {
      continue
    }

    output.push({
      id: createDocsNodeId(['breadcrumb-page', item.id]),
      type: item.type,
      title: item.title,
      path: itemPath,
    })
  }

  return output
}

export function findDocsRoot(items: DocsNode[], path: string) {
  const ancestors = findDocsAncestors(items, path)
  return ancestors.findLast((item) => item.root)
}

function getSidebarItemsForNode(node: DocsNode) {
  if (node.type !== 'group') {
    return []
  }

  const items: DocsNode[] = []
  if (node.index) {
    const indexNode = cloneNode(node.index)
    const indexPatch = {
      title: node.title,
      description: node.description ?? node.index.description,
      badge: node.badge ?? node.index.badge,
      icon: node.icon ?? node.index.icon,
      status: node.status ?? node.index.status,
    }

    items.push(
      decorateNode(
        {
          ...indexNode,
          type: indexNode.type === 'link' ? 'link' : 'page',
          children: [],
        },
        indexPatch,
      ),
    )
  }

  return [...items, ...node.children]
}

export function findSidebarBranch(items: DocsNode[], path: string): DocsNode[] {
  const sectionRoot = findDocsRoot(items, path)
  if (sectionRoot) {
    return getSidebarItemsForNode(sectionRoot)
  }

  return items
}

export function resolveSectionHeadline(items: DocsNode[], path: string) {
  const root = findDocsRoot(items, path)
  if (root) {
    return root.sectionLabel ?? root.title ?? 'Docs'
  }

  const ancestors = findDocsAncestors(items, path)
  const section = ancestors.findLast(
    (item) => item.type === 'group' && item.children.length > 0,
  )

  return (
    section?.sectionLabel ?? section?.title ?? ancestors.at(-1)?.title ?? 'Docs'
  )
}
