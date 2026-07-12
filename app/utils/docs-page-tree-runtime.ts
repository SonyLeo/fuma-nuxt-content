import type { ContentNavigationItem } from '@nuxt/content'
import type {
  DocsBreadcrumbItem,
  DocsBreadcrumbOptions,
  DocsDirectoryMeta,
  DocsHomepageNavigation,
  DocsHomepageNavigationItem,
  DocsNode,
  DocsPageTreePageInput,
  DocsPagerItem,
} from '~/types/docs'
import type { DocsNodePolicy } from '~/utils/docs-page-tree-policy'
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
import {
  resolveDocsDirectoryTarget,
  resolveDocsNodePolicy,
} from '~/utils/docs-page-tree-policy'

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
  pageBySourcePath: ReadonlyMap<string, DocsPageTreePageInput>
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
  pagePolicyBySourcePath: ReadonlyMap<string, DocsNodePolicy>
  homepageNavigation: DocsHomepageNavigation
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
  getPagePolicy: (sourcePath: string) => DocsNodePolicy | null
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
    pageBySourcePath: options.pageBySourcePath,
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
  const visibleBySourcePath = createSourcePathMap(visibleTree)
  const nodeBySourcePath = createSourcePathMap(contextTree)
  const pagePolicyBySourcePath = new Map<string, DocsNodePolicy>()

  for (const [sourcePath, node] of nodeBySourcePath) {
    const input = options.pageBySourcePath.get(sourcePath)

    pagePolicyBySourcePath.set(
      sourcePath,
      resolveDocsNodePolicy(node, {
        visible: visibleBySourcePath.has(sourcePath),
        contextual: true,
        publishable: input?.publishable ?? false,
      }),
    )
  }

  function getPagePolicy(sourcePath: string) {
    return (
      pagePolicyBySourcePath.get(normalizeDocsSourcePath(sourcePath)) ?? null
    )
  }

  function getHomepagePath(node: DocsNode) {
    if (node.type === 'page') {
      return node.path ?? null
    }

    if (node.type !== 'group') {
      return null
    }

    const target = resolveDocsDirectoryTarget(node)
    return target ? (node.path ?? target) : null
  }

  function createHomepageItem(
    node: DocsNode,
  ): DocsHomepageNavigationItem | null {
    const policy = resolveDocsNodePolicy(node, {
      visible: true,
      contextual: true,
    })
    const path = policy.homepage ? getHomepagePath(node) : null

    if (!path) {
      return null
    }

    return {
      id: node.id,
      title: node.title,
      description: node.description,
      badge: node.badge,
      path,
    }
  }

  const homepageNavigation: DocsHomepageNavigation = {
    sections: visibleTree
      .flatMap((node) => {
        const item = createHomepageItem(node)
        return item ? [item] : []
      })
      .slice(0, 4),
    featured: visibleTree
      .flatMap((node) => (node.children.length > 0 ? node.children : [node]))
      .flatMap((node) => {
        const item = createHomepageItem(node)
        return item ? [item] : []
      })
      .slice(0, 6),
  }

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
    const pages = visibleFlat.filter((item) => {
      return item.sourcePath
        ? (getPagePolicy(item.sourcePath)?.pager ?? false)
        : false
    })
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
    const current = getVisibleCurrent(path)

    if (!current || current.type !== 'group') {
      return null
    }

    const targetPath = resolveDocsDirectoryTarget(current)

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
    pagePolicyBySourcePath,
    homepageNavigation,
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
    getPagePolicy,
  }
}
