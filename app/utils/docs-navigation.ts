import type { ContentNavigationItem } from '@nuxt/content'
import type {
  DocsBreadcrumbItem,
  DocsBreadcrumbOptions,
  DocsBreadcrumbRootOption,
  DocsDirectoryMeta,
  DocsMetaPageEntry,
  DocsNode,
  DocsPageIdentity,
  DocsPageMeta,
} from '~/types/docs'
import {
  normalizeDocsRoutePath,
  normalizeDocsSourcePath,
  resolveDocsRoutePath,
} from '#shared/docs-identity.js'

export {
  normalizeDocsRoutePath,
  normalizeDocsSourcePath,
  resolveDocsRoutePath,
} from '#shared/docs-identity.js'

export const docsNavigationFields = ['docsMetadata'] as const

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

type DocsNavigationItem = ContentNavigationItem & {
  docsMetadata?: DocsPageMeta
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

export function resolveDocsPageIdentity(
  record: Pick<DocsRouteRecord, 'path' | 'stem' | 'slug'>,
): DocsPageIdentity {
  const sourcePath = resolveDocsRecordSourcePath(record)

  return {
    contentPath: record.path,
    sourcePath,
    routePath: resolveDocsRoutePath(sourcePath, record),
    stem: record.stem,
    slug: record.slug,
  }
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
  return (
    (item as DocsNavigationItem).docsMetadata ??
    fallback ?? {
      title: item.title,
    }
  )
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
    ? (directoryMetaByStem.get(normalizedStem) ??
      directoryMetaByStem.get(normalizeStem(getDirnameFromPath(sourcePath))))
    : directoryMetaByStem.get(normalizedStem)
  const groupCollapsible = isGroup
    ? (directoryMeta?.collapsible ?? pageMeta?.collapsible)
    : mergedMeta.collapsible
  const groupDefaultOpen = isGroup
    ? (directoryMeta?.defaultOpen ??
      pageMeta?.defaultOpen ??
      (groupCollapsible === false ? true : undefined))
    : mergedMeta.defaultOpen

  const baseNode: DocsNode = {
    id: createDocsNodeId([
      isGroup ? 'group' : 'page',
      sourcePath ?? stem ?? path ?? mergedMeta.title,
    ]),
    type: isGroup ? 'group' : 'page',
    title: directoryMeta?.title ?? mergedMeta.title,
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
    defaultOpen: groupDefaultOpen,
    collapsible: groupCollapsible,
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

function isVirtualMetaGroupEntry(entry: DocsMetaPageEntry): entry is Extract<
  DocsMetaPageEntry,
  { type: 'page' | 'group' }
> & {
  type: 'group'
} {
  return (
    typeof entry === 'object' &&
    entry.type === 'group' &&
    (Boolean(entry.pages?.length) || Boolean(entry.pagesIndex))
  )
}

function matchesMetaEntryName(node: DocsNode, name: string) {
  const key = normalizeName(name)
  const normalizedPath = name.startsWith('/')
    ? normalizeDocsRoutePath(name)
    : normalizeDocsRoutePath(`/${name}`)

  return (
    getMetaEntryKey(node) === key ||
    normalizeName(node.stem) === key ||
    normalizeName(node.dirname) === key ||
    node.path === name ||
    node.path === normalizedPath ||
    node.href === name
  )
}

function findUnconsumedMetaChild(
  children: DocsNode[],
  name: string,
  consumed: Set<string>,
) {
  return children.find((child) => {
    return (
      !consumed.has(getNodeSortKey(child)) && matchesMetaEntryName(child, name)
    )
  })
}

function consumeNode(node: DocsNode | undefined, consumed: Set<string>) {
  if (node) {
    consumed.add(getNodeSortKey(node))
  }
}

function createVirtualGroupBaseNode(
  entry: Extract<DocsMetaPageEntry, { type: 'page' | 'group' }> & {
    type: 'group'
  },
  parent: DocsNode,
  keySuffix?: string | number,
) {
  return {
    id: createDocsNodeId([
      'group',
      parent.sourcePath ?? parent.path ?? parent.title,
      entry.name,
      keySuffix,
    ]),
    type: 'group' as const,
    title: entry.title ?? entry.name,
    path: undefined,
    sourcePath: undefined,
    stem: undefined,
    dirname: parent.dirname,
    parentPath: parent.path,
    level: (parent.level ?? 0) + 1,
    description: undefined,
    sectionLabel: undefined,
    order: undefined,
    hidden: entry.hidden,
    badge: entry.badge,
    icon: entry.icon,
    status: entry.status,
    root: undefined,
    defaultOpen: entry.defaultOpen,
    collapsible: entry.collapsible,
    rootPath: parent.rootPath,
    children: [],
  } satisfies DocsNode
}

function createVirtualGroupIndexNode(
  entry: Extract<DocsMetaPageEntry, { type: 'page' | 'group' }> & {
    type: 'group'
  },
  group: DocsNode,
  children: DocsNode[],
  consumed: Set<string>,
): DocsNode | undefined {
  if (!entry.pagesIndex) {
    return undefined
  }

  const match = findUnconsumedMetaChild(children, entry.pagesIndex, consumed)
  if (!match) {
    if (isLinkString(entry.pagesIndex)) {
      const link = parseLinkString(entry.pagesIndex)

      return link ? createLinkNode(link, group, 'index') : undefined
    }

    return undefined
  }

  consumeNode(match, consumed)

  const indexSource = match.type === 'group' ? match.index : match
  if (!indexSource || indexSource.type === 'separator') {
    return undefined
  }

  const indexNode = cloneNode(indexSource)

  return decorateNode(
    {
      ...indexNode,
      type: indexNode.type === 'link' ? 'link' : 'page',
      children: [],
    },
    {},
  )
}

function createVirtualGroupChildren(
  entries: DocsMetaPageEntry[],
  sourceChildren: DocsNode[],
  group: DocsNode,
  consumed: Set<string>,
  options: Pick<DocsTreeOptions, 'preserveExcluded'>,
): DocsNode[] {
  const orderedChildren: DocsNode[] = []

  for (const entry of entries) {
    if (typeof entry === 'string') {
      if (isSeparatorString(entry)) {
        const separator = parseSeparatorString(entry)
        if (separator) {
          orderedChildren.push({
            ...createSeparatorNode(
              separator.title,
              group,
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
            createLinkNode(link, group, orderedChildren.length),
          )
        }
        continue
      }

      if (isExcludeString(entry)) {
        if (options.preserveExcluded) {
          continue
        }

        const target = parseExcludeTarget(entry)
        const matches = collectMatchedChildren(sourceChildren, target)
        for (const child of matches) {
          consumeNode(child, consumed)
        }
        continue
      }

      if (isRestString(entry)) {
        const reversed = isReversedRestString(entry)
        const rest = reversed
          ? sourceChildren
              .filter((child) => !consumed.has(getNodeSortKey(child)))
              .toSorted(compareNodes)
              .reverse()
          : (() => {
              const target = parseRestTarget(entry)
              return target
                ? collectExtractedChildren(sourceChildren, target, consumed)
                : sourceChildren.filter(
                    (child) => !consumed.has(getNodeSortKey(child)),
                  )
            })()

        orderedChildren.push(...(reversed ? rest : rest.toSorted(compareNodes)))
        for (const child of rest) {
          consumeNode(child, consumed)
        }
        continue
      }

      const match = findUnconsumedMetaChild(sourceChildren, entry, consumed)
      if (match) {
        orderedChildren.push(match)
        consumeNode(match, consumed)
      }
      continue
    }

    if (entry.type === 'separator') {
      orderedChildren.push({
        ...createSeparatorNode(entry.title, group, orderedChildren.length),
        icon: entry.icon,
      })
      continue
    }

    if (entry.type === 'link') {
      orderedChildren.push(createLinkNode(entry, group, orderedChildren.length))
      continue
    }

    if (isVirtualMetaGroupEntry(entry)) {
      orderedChildren.push(
        createVirtualMetaGroupNode(
          entry,
          group,
          sourceChildren,
          consumed,
          orderedChildren.length,
          options,
        ),
      )
      continue
    }

    const match = findUnconsumedMetaChild(sourceChildren, entry.name, consumed)
    if (match) {
      orderedChildren.push(applyMetaEntryToNode(match, entry))
      consumeNode(match, consumed)
    }
  }

  return orderedChildren
}

function createVirtualMetaGroupNode(
  entry: Extract<DocsMetaPageEntry, { type: 'page' | 'group' }> & {
    type: 'group'
  },
  parent: DocsNode,
  sourceChildren: DocsNode[],
  consumed: Set<string>,
  keySuffix?: string | number,
  options: Pick<DocsTreeOptions, 'preserveExcluded'> = {},
) {
  const groupBase = createVirtualGroupBaseNode(entry, parent, keySuffix)
  const index = createVirtualGroupIndexNode(
    entry,
    groupBase,
    sourceChildren,
    consumed,
  )
  const children = createVirtualGroupChildren(
    entry.pages ?? [],
    sourceChildren,
    groupBase,
    consumed,
    options,
  )

  return {
    ...groupBase,
    path: index?.path,
    sourcePath: index?.sourcePath,
    stem: index?.stem,
    description: index?.description,
    index,
    children,
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

function normalizeDirectoryMetaCandidate(value?: string) {
  return normalizeStem(value?.replace(/^\//, '') ?? '')
}

function resolveDirectoryMetaForNode(
  node: DocsNode,
  directoryMetaByStem: Map<string, DocsDirectoryMeta>,
) {
  const candidates = [
    node.stem,
    node.sourcePath,
    node.dirname,
    getDirnameFromPath(node.sourcePath),
    getDirnameFromPath(node.path),
  ]
    .map(normalizeDirectoryMetaCandidate)
    .filter(Boolean)
    .toSorted((left, right) => right.length - left.length)

  for (const candidate of new Set(candidates)) {
    const meta = directoryMetaByStem.get(candidate)

    if (meta) {
      return meta
    }
  }

  return undefined
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
              (node.stem ?? node.sourcePath ?? '').replace(/^\//, ''),
            )
          : ''
      const meta =
        node.type === 'group'
          ? resolveDirectoryMetaForNode(node, directoryMetaByStem)
          : nodeDirectoryStem
            ? directoryMetaByStem.get(nodeDirectoryStem)
            : node.stem
              ? directoryMetaByStem.get(normalizeStem(node.stem))
              : undefined

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

        if (isVirtualMetaGroupEntry(entry)) {
          orderedChildren.push(
            createVirtualMetaGroupNode(
              entry,
              currentNode,
              currentNode.children,
              consumed,
              orderedChildren.length,
              options,
            ),
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
        DocsRouteRecord & {
          docsMetadata: DocsPageMeta
        }
      >
    | null
    | undefined,
) {
  assertUniqueDocsRoutePaths(items)

  return new Map(
    (items ?? []).map((item) => {
      const identity = resolveDocsPageIdentity(item)

      return [identity.sourcePath, item.docsMetadata] as const
    }),
  )
}

export function assertUniqueDocsRoutePaths(
  items: DocsRouteRecord[] | null | undefined,
) {
  const routeToSources = new Map<string, string[]>()

  for (const item of items ?? []) {
    const identity = resolveDocsPageIdentity(item)
    const routePath = identity.routePath
    const sources = routeToSources.get(routePath) ?? []
    sources.push(identity.sourcePath)
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
  items: DocsDirectoryMeta[] | null | undefined,
) {
  return new Map((items ?? []).map((item) => [item.stem, item]))
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
  items: DocsRouteRecord[] | null | undefined,
  routePath: string,
) {
  const normalizedRoutePath = normalizeDocsRoutePath(routePath)
  const match = (items ?? []).find((item) => {
    return resolveDocsPageIdentity(item).routePath === normalizedRoutePath
  })

  return match ? resolveDocsPageIdentity(match).sourcePath : null
}

export function findDocsPageRecordByRoute<T extends DocsRouteRecord>(
  items: T[] | null | undefined,
  routePath: string,
) {
  const normalizedRoutePath = normalizeDocsRoutePath(routePath)

  return (
    (items ?? []).find((item) => {
      const identity = resolveDocsPageIdentity(item)

      return (
        identity.routePath === normalizedRoutePath ||
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
