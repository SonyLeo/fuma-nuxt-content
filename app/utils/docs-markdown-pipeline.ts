import { parseDocsCodeBlockMeta } from './docs-code-meta'

type HastText = {
  type: 'text'
  value: string
}

type HastElement = {
  type: 'element'
  tagName?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

type HastNode =
  | HastText
  | HastElement
  | {
      type: string
      [key: string]: unknown
    }

type HastRoot = {
  type: 'root'
  children?: HastNode[]
}

type MarkdownStructuredData = {
  headings: Array<{
    id: string
    content: string
  }>
  contents: Array<{
    heading?: string
    content: string
  }>
}

const customHeadingIdPattern = /\s*(?:\[#([^\]]+)]|#([A-Za-z0-9_-]+))\s*$/
const headingTagPattern = /^h[1-6]$/
const slugUnsafePattern = /[^\p{L}\p{N}\s-]/gu
const whitespacePattern = /\s+/g

function isElement(node: HastNode | HastRoot | undefined): node is HastElement {
  return node?.type === 'element'
}

function isText(node: HastNode | undefined): node is HastText {
  return node?.type === 'text'
}

function getNodeText(node: HastNode): string {
  if (isText(node)) {
    return node.value
  }

  if (isElement(node) && node.tagName === 'img') {
    return ''
  }

  if (isElement(node)) {
    return (node.children ?? []).map(getNodeText).join('')
  }

  return ''
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

function createGithubLikeSlugger() {
  const counts = new Map<string, number>()

  return {
    slug(value: string) {
      const base =
        value
          .trim()
          .toLowerCase()
          .replace(slugUnsafePattern, '')
          .replace(whitespacePattern, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .replace(/^(\d)/, '_$1') || 'section'
      const count = counts.get(base) ?? 0

      counts.set(base, count + 1)

      return count > 0 ? `${base}-${count}` : base
    },
  }
}

function readElementId(node: HastElement) {
  const id = node.properties?.id

  return typeof id === 'string' ? id : undefined
}

function readCustomHeadingId(node: HastElement) {
  const match = getNodeText(node).match(customHeadingIdPattern)

  return match?.[1] ?? match?.[2]
}

function removeCustomHeadingIdMarker(node: HastNode): boolean {
  if (isText(node)) {
    const match = node.value.match(customHeadingIdPattern)

    if (!match) {
      return false
    }

    node.value = node.value.slice(0, match.index).trimEnd()

    return true
  }

  if (!isElement(node) || !node.children) {
    return false
  }

  for (let index = node.children.length - 1; index >= 0; index--) {
    const child = node.children[index]

    if (!child) {
      continue
    }

    if (!removeCustomHeadingIdMarker(child)) {
      continue
    }

    if (!getNodeText(child).trim()) {
      node.children.splice(index, 1)
    }

    return true
  }

  return false
}

function applyCustomHeadingId(node: HastElement) {
  const id = readCustomHeadingId(node)

  if (!id) {
    return
  }

  node.properties ??= {}
  node.properties.id = id
  removeCustomHeadingIdMarker(node)
}

function isStructuredContentElement(node: HastElement) {
  return ['blockquote', 'li', 'p', 'td', 'th'].includes(node.tagName ?? '')
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
  return (tree: HastRoot, file: { data?: Record<string, unknown> }) => {
    const slugger = createGithubLikeSlugger()
    const structuredData: MarkdownStructuredData = {
      headings: [],
      contents: [],
    }
    let currentHeading: string | undefined

    visitElements(tree, (node) => {
      if (node.tagName && headingTagPattern.test(node.tagName)) {
        applyCustomHeadingId(node)

        const text = getNodeText(node).trim()

        if (!readElementId(node)) {
          node.properties ??= {}
          node.properties.id = slugger.slug(text)
        }

        const id = readElementId(node)

        if (id && text) {
          structuredData.headings.push({
            id,
            content: text,
          })
          currentHeading = id
        }

        return
      }

      applyCodeBlockMeta(node)

      if (!isStructuredContentElement(node)) {
        return
      }

      const content = getNodeText(node).replace(whitespacePattern, ' ').trim()

      if (content) {
        structuredData.contents.push({
          heading: currentHeading,
          content,
        })
      }
    })

    file.data ??= {}
    file.data.structuredData = structuredData
  }
}

export default rehypeDocsMarkdownPipeline
