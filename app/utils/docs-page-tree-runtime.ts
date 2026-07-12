import type { ContentNavigationItem } from '@nuxt/content'
import type {
  DocsBreadcrumbItem,
  DocsBreadcrumbOptions,
  DocsDirectoryMeta,
  DocsNode,
  DocsPageMeta,
  DocsPagerItem,
} from '~/types/docs'
import {
  buildDocsTree,
  createDocsBreadcrumbItems,
  findDocsRoot,
  findSidebarBranch,
  flattenDocsNodes,
  normalizeDocsRoutePath,
  normalizeDocsSourcePath,
  resolveSectionHeadline,
} from '~/utils/docs-navigation'

export type DocsPageTreeTransformTree = 'visible' | 'context'

export type DocsPageTreeTransformContext = {
  tree: DocsPageTreeTransformTree
  includeHidden: boolean
  preserveExcluded: boolean
}

export type DocsPageTreeTransformResult = DocsNode | null | undefined
type DocsTypedNode<T extends DocsNode['type']> = DocsNode & { type: T }

export type DocsPageTreeTransformer = {
  page?: (
    node: DocsTypedNode<'page'>,
    context: DocsPageTreeTransformContext,
  ) => DocsPageTreeTransformResult
  group?: (
    node: DocsTypedNode<'group'>,
    context: DocsPageTreeTransformContext,
  ) => DocsPageTreeTransformResult
  separator?: (
    node: DocsTypedNode<'separator'>,
    context: DocsPageTreeTransformContext,
  ) => DocsPageTreeTransformResult
  link?: (
    node: DocsTypedNode<'link'>,
    context: DocsPageTreeTransformContext,
  ) => DocsPageTreeTransformResult
  node?: (
    node: DocsNode,
    context: DocsPageTreeTransformContext,
  ) => DocsPageTreeTransformResult
  root?: (
    nodes: DocsNode[],
    context: DocsPageTreeTransformContext,
  ) => DocsNode[] | null | undefined
}

export type DocsPageTreeRuntimeOptions = {
  navigation: ContentNavigationItem[] | null | undefined
  pageMetaByPath?: Map<string, DocsPageMeta>
  directoryMetaByStem?: Map<string, DocsDirectoryMeta>
  transformers?: DocsPageTreeTransformer[]
}

export type DocsPageTreeRuntime = {
  kind: 'docs-page-tree-runtime'
  visibleTree: DocsNode[]
  contextTree: DocsNode[]
  visibleFlat: DocsNode[]
  contextFlat: DocsNode[]
  visibleByPath: ReadonlyMap<string, DocsNode>
  contextByPath: ReadonlyMap<string, DocsNode>
  nodeBySourcePath: ReadonlyMap<string, DocsNode>
  getVisibleCurrent: (path: string) => DocsNode | null
  getCurrent: (path: string) => DocsNode | null
  getContextualTree: (path: string) => DocsNode[]
  getSidebarItems: (path: string) => DocsNode[]
  getSectionHeadline: (path: string) => string
  getBreadcrumbs: (
    path: string,
    options?: DocsBreadcrumbOptions,
  ) => DocsBreadcrumbItem[]
  getPager: (path: string) => {
    previous: DocsPagerItem | null
    next: DocsPagerItem | null
  }
  getFallbackPath: (path: string) => string | null
  getNodeByPath: (
    path: string,
    tree?: DocsPageTreeTransformTree,
  ) => DocsNode | null
  getNodeBySourcePath: (sourcePath: string) => DocsNode | null
}

function normalizePathKey(path?: string) {
  return path ? normalizeDocsRoutePath(path) : ''
}

function createPathMap(nodes: DocsNode[]) {
  const output = new Map<string, DocsNode>()

  function visit(node: DocsNode) {
    const nodePath = normalizePathKey(node.path)
    if (nodePath && !output.has(nodePath)) {
      output.set(nodePath, node)
    }

    const indexPath = normalizePathKey(node.index?.path)
    if (indexPath && !output.has(indexPath)) {
      output.set(indexPath, node)
    }

    if (node.index) {
      visit(node.index)
    }

    for (const child of node.children) {
      visit(child)
    }
  }

  for (const node of nodes) {
    visit(node)
  }

  return output
}

function createSourcePathMap(nodes: DocsNode[]) {
  const output = new Map<string, DocsNode>()

  for (const node of flattenDocsNodes(nodes)) {
    const key = node.sourcePath
    if (key && !output.has(key)) {
      output.set(key, node)
    }
  }

  return output
}

function getNodeTargetPath(node: DocsNode) {
  if (node.type === 'page') {
    return node.path
  }

  if (node.type === 'link' && !node.external && node.href?.startsWith('/')) {
    return node.href
  }

  if (node.index?.path) {
    return node.index.path
  }

  if (
    node.index?.type === 'link' &&
    !node.index.external &&
    node.index.href?.startsWith('/')
  ) {
    return node.index.href
  }

  return undefined
}

function findFirstNavigablePath(node: DocsNode): string | null {
  const targetPath = getNodeTargetPath(node)
  if (targetPath) {
    return targetPath
  }

  for (const child of node.children) {
    const childTargetPath = findFirstNavigablePath(child)

    if (childTargetPath) {
      return childTargetPath
    }
  }

  return null
}

function applyTransformerForNode(
  node: DocsNode,
  transformer: DocsPageTreeTransformer,
  context: DocsPageTreeTransformContext,
): DocsPageTreeTransformResult {
  if (node.type === 'page') {
    return transformer.page?.(node as DocsTypedNode<'page'>, context)
  }

  if (node.type === 'group') {
    return transformer.group?.(node as DocsTypedNode<'group'>, context)
  }

  if (node.type === 'separator') {
    return transformer.separator?.(node as DocsTypedNode<'separator'>, context)
  }

  return transformer.link?.(node as DocsTypedNode<'link'>, context)
}

function runNodeTransformers(
  node: DocsNode,
  transformers: DocsPageTreeTransformer[],
  context: DocsPageTreeTransformContext,
) {
  let current: DocsNode | null = node

  for (const transformer of transformers) {
    if (!current) {
      return null
    }

    const typedResult: DocsPageTreeTransformResult = applyTransformerForNode(
      current,
      transformer,
      context,
    )
    if (typedResult === null) {
      return null
    }
    if (typedResult) {
      current = typedResult
    }

    const genericResult: DocsPageTreeTransformResult = transformer.node?.(
      current,
      context,
    )
    if (genericResult === null) {
      return null
    }
    if (genericResult) {
      current = genericResult
    }
  }

  return current
}

function applyDocsPageTreeTransformers(
  nodes: DocsNode[],
  transformers: DocsPageTreeTransformer[],
  context: DocsPageTreeTransformContext,
) {
  if (transformers.length === 0) {
    return nodes
  }

  function visit(node: DocsNode): DocsNode | null {
    const index = node.index ? (visit(node.index) ?? undefined) : undefined
    const children = node.children.flatMap((child) => {
      const transformed = visit(child)
      return transformed ? [transformed] : []
    })
    const transformedNode = runNodeTransformers(
      {
        ...node,
        index,
        children,
      },
      transformers,
      context,
    )

    return transformedNode
  }

  let output = nodes.flatMap((node) => {
    const transformed = visit(node)
    return transformed ? [transformed] : []
  })

  for (const transformer of transformers) {
    const rootResult = transformer.root?.(output, context)
    if (rootResult) {
      output = rootResult
    }
  }

  return output
}

function createTree(
  options: DocsPageTreeRuntimeOptions,
  context: DocsPageTreeTransformContext,
) {
  const nodes = buildDocsTree({
    navigation: options.navigation,
    pageMetaByPath: options.pageMetaByPath,
    directoryMetaByStem: options.directoryMetaByStem,
    includeHidden: context.includeHidden,
    preserveExcluded: context.preserveExcluded,
  })

  return applyDocsPageTreeTransformers(
    nodes,
    options.transformers ?? [],
    context,
  )
}

export function isDocsPageTreeRuntime(
  value: DocsNode[] | DocsPageTreeRuntime,
): value is DocsPageTreeRuntime {
  return !Array.isArray(value) && value.kind === 'docs-page-tree-runtime'
}

export function createDocsPageTreeRuntime(
  options: DocsPageTreeRuntimeOptions,
): DocsPageTreeRuntime {
  const visibleTree = createTree(options, {
    tree: 'visible',
    includeHidden: false,
    preserveExcluded: false,
  })
  const contextTree = createTree(options, {
    tree: 'context',
    includeHidden: true,
    preserveExcluded: true,
  })
  const visibleFlat = flattenDocsNodes(visibleTree)
  const contextFlat = flattenDocsNodes(contextTree)
  const visibleByPath = createPathMap(visibleTree)
  const contextByPath = createPathMap(contextTree)
  const nodeBySourcePath = createSourcePathMap(contextTree)

  function getNodeByPath(
    path: string,
    tree: DocsPageTreeTransformTree = 'visible',
  ) {
    const map = tree === 'visible' ? visibleByPath : contextByPath
    return map.get(normalizePathKey(path)) ?? null
  }

  function getVisibleCurrent(path: string) {
    return getNodeByPath(path, 'visible')
  }

  function getCurrent(path: string) {
    return getVisibleCurrent(path) ?? getNodeByPath(path, 'context')
  }

  function getContextualTree(path: string) {
    return getVisibleCurrent(path) ? visibleTree : contextTree
  }

  function getSidebarItems(path: string) {
    if (getVisibleCurrent(path)) {
      return findSidebarBranch(visibleTree, path).filter((item) => !item.hidden)
    }

    const contextRoot = findDocsRoot(contextTree, path)
    const rootPath = contextRoot?.path ?? contextRoot?.index?.path

    return findSidebarBranch(visibleTree, rootPath ?? path).filter(
      (item) => !item.hidden,
    )
  }

  function getPager(path: string) {
    const pages = visibleFlat.filter((item) => item.path)
    const normalizedCurrentPath = normalizeDocsRoutePath(path)
    const currentIndex = pages.findIndex((item) => {
      return normalizeDocsRoutePath(item.path) === normalizedCurrentPath
    })

    return {
      previous:
        currentIndex > 0 ? (pages[currentIndex - 1] as DocsPagerItem) : null,
      next:
        currentIndex >= 0
          ? ((pages[currentIndex + 1] as DocsPagerItem | undefined) ?? null)
          : null,
    }
  }

  function getFallbackPath(path: string) {
    const normalizedCurrentPath = normalizeDocsRoutePath(path)
    const current = getCurrent(path)

    if (!current || current.type !== 'group') {
      return null
    }

    const targetPath = findFirstNavigablePath(current)

    if (
      !targetPath ||
      normalizeDocsRoutePath(targetPath) === normalizedCurrentPath
    ) {
      return null
    }

    return targetPath
  }

  return {
    kind: 'docs-page-tree-runtime',
    visibleTree,
    contextTree,
    visibleFlat,
    contextFlat,
    visibleByPath,
    contextByPath,
    nodeBySourcePath,
    getVisibleCurrent,
    getCurrent,
    getContextualTree,
    getSidebarItems,
    getSectionHeadline: (path) =>
      resolveSectionHeadline(getContextualTree(path), path),
    getBreadcrumbs: (path, options = {}) =>
      createDocsBreadcrumbItems(getContextualTree(path), path, options),
    getPager,
    getFallbackPath,
    getNodeByPath,
    getNodeBySourcePath: (sourcePath) =>
      nodeBySourcePath.get(normalizeDocsSourcePath(sourcePath)) ?? null,
  }
}
