import type { DocsNode } from '~/types/docs'

export type DocsNodePolicy = {
  visible: boolean
  contextual: boolean
  searchable: boolean
  publishable: boolean
  pager: boolean
  homepage: boolean
  directoryTarget: boolean
}

type DocsNodePolicyContext = {
  visible: boolean
  contextual: boolean
  publishable?: boolean
}

export function resolveDocsInternalTargetPath(node: DocsNode) {
  if (node.type === 'page') {
    return node.path ?? null
  }

  if (node.type === 'link' && !node.external && node.href?.startsWith('/')) {
    return node.href
  }

  return null
}

export function resolveDocsNodePolicy(
  node: DocsNode,
  context: DocsNodePolicyContext,
): DocsNodePolicy {
  const publishable = context.publishable ?? true
  const internalTarget = resolveDocsInternalTargetPath(node)
  const visible = context.visible && !node.hidden
  const contextual = context.contextual
  const contentPage = node.type === 'page' && Boolean(node.sourcePath)

  return {
    visible,
    contextual,
    searchable:
      publishable && contextual && contentPage && !node.hidden && !!node.path,
    publishable,
    pager: publishable && visible && contentPage && !!node.path,
    homepage:
      publishable && visible && (node.type === 'page' || node.type === 'group'),
    directoryTarget: publishable && visible && Boolean(internalTarget),
  }
}

function resolveExplicitDirectoryIndex(node: DocsNode) {
  if (!node.index) {
    return null
  }

  const policy = resolveDocsNodePolicy(node.index, {
    visible: true,
    contextual: true,
  })

  return policy.directoryTarget
    ? resolveDocsInternalTargetPath(node.index)
    : null
}

function resolveFirstVisibleInternalDescendant(
  nodes: DocsNode[],
): string | null {
  for (const node of nodes) {
    const policy = resolveDocsNodePolicy(node, {
      visible: true,
      contextual: true,
    })
    const directTarget = policy.directoryTarget
      ? resolveDocsInternalTargetPath(node)
      : null

    if (directTarget) {
      return directTarget
    }

    if (node.type !== 'group' || !policy.visible) {
      continue
    }

    const indexTarget = resolveExplicitDirectoryIndex(node)
    if (indexTarget) {
      return indexTarget
    }

    const childTarget = resolveFirstVisibleInternalDescendant(node.children)
    if (childTarget) {
      return childTarget
    }
  }

  return null
}

export function resolveDocsDirectoryTarget(node: DocsNode) {
  if (node.type !== 'group' || node.hidden) {
    return null
  }

  return (
    resolveExplicitDirectoryIndex(node) ??
    resolveFirstVisibleInternalDescendant(node.children)
  )
}
