import { parseDocsCodeBlockMeta } from './docs-code-meta'

type HastElement = {
  type: 'element'
  tagName?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

type HastNode =
  | HastElement
  | {
      type: string
      [key: string]: unknown
    }

type HastRoot = {
  type: 'root'
  children?: HastNode[]
}

function isElement(node: HastNode | HastRoot | undefined): node is HastElement {
  return node?.type === 'element'
}

function visitElements(
  node: HastNode | HastRoot,
  visitor: (node: HastElement) => void,
) {
  if (isElement(node)) {
    visitor(node)
  }

  let children: HastNode[] = []

  if (isElement(node)) {
    children = node.children ?? []
  } else if (node.type === 'root') {
    children = (node as HastRoot).children ?? []
  }

  for (const child of children) {
    visitElements(child, visitor)
  }
}

function applyCodeBlockMeta(node: HastElement) {
  if (node.tagName !== 'pre') {
    return
  }

  const meta = node.properties?.meta

  if (typeof meta !== 'string' || !meta.trim()) {
    return
  }

  const parsed = parseDocsCodeBlockMeta(meta)

  node.properties ??= {}

  if (parsed.title) {
    node.properties.title = parsed.title
    node.properties.filename ??= parsed.title
  }

  if (parsed.icon) {
    node.properties.icon = parsed.icon
  }

  if (parsed.keepBackground) {
    node.properties.keepBackground = true
  }

  if (parsed.lineNumbers) {
    node.properties.dataLineNumbers = true
    node.properties.dataLineNumbersStart = parsed.lineNumbersStart
    node.properties['data-line-numbers'] = ''
    node.properties['data-line-numbers-start'] = String(parsed.lineNumbersStart)
  }

  if (parsed.rest) {
    node.properties['data-code-meta'] = parsed.rest
  }
}

export function rehypeDocsMarkdownPipeline() {
  return (tree: HastRoot) => {
    visitElements(tree, (node) => {
      applyCodeBlockMeta(node)
    })
  }
}

export default rehypeDocsMarkdownPipeline
