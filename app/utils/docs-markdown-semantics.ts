import GithubSlugger from 'github-slugger'

type MarkdownNodeData = {
  hProperties?: Record<string, unknown>
}

type MarkdownNode = {
  type: string
  value?: string
  depth?: number
  name?: string
  attributes?: Record<string, unknown>
  data?: MarkdownNodeData
  children?: MarkdownNode[]
}

type MarkdownRoot = MarkdownNode & {
  type: 'root'
  children: MarkdownNode[]
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

type MarkdownFile = {
  data?: Record<string, unknown>
}

type MarkdownRenderedNode = {
  type?: string
  tag?: string
  props?: Record<string, unknown>
  children?: MarkdownRenderedNode[]
}

type MarkdownCompileResult = {
  body?: MarkdownRenderedNode
  excerpt?: MarkdownRenderedNode
}

type MarkdownProcessor = {
  Compiler?: (tree: unknown, file?: unknown) => MarkdownCompileResult
  use: (plugin: () => void) => MarkdownProcessor
}

type MarkdownSemanticsPlugin = {
  (): (tree: MarkdownRoot, file: MarkdownFile) => void
  unified?: {
    post: (processor: MarkdownProcessor) => MarkdownProcessor
  }
}

const canonicalHeadingIdProperty = 'data-canonical-heading-id'
const canonicalHeadingIdPropertyName = 'dataCanonicalHeadingId'
const customHeadingIdPattern = /\s*\[#([^\]]+)]\s*$/
const structuredBlockTypes = new Set(['blockquote', 'paragraph', 'tableCell'])
const whitespacePattern = /\s+/g

function flattenMarkdownNode(node: MarkdownNode): string {
  if (node.type === 'image' || node.type === 'imageReference') {
    return ''
  }

  if (node.children) {
    return node.children.map(flattenMarkdownNode).join('')
  }

  return typeof node.value === 'string' ? node.value : ''
}

function trimTrailingWhitespace(node: MarkdownNode) {
  if (!node.children) {
    if (node.type === 'text' && typeof node.value === 'string') {
      node.value = node.value.trimEnd()
    }

    return
  }

  while (node.children.length > 0) {
    const lastChild = node.children.at(-1)

    if (!lastChild) {
      return
    }

    trimTrailingWhitespace(lastChild)

    if (flattenMarkdownNode(lastChild)) {
      return
    }

    node.children.pop()
  }
}

function removeCustomHeadingId(node: MarkdownNode): string | undefined {
  const lastChild = node.children?.at(-1)

  // remark-mdc parses the canonical `[#id]` marker as an empty span label.
  if (
    lastChild?.type === 'textComponent' &&
    lastChild.name === 'span' &&
    Object.keys(lastChild.attributes ?? {}).length === 0
  ) {
    const match = flattenMarkdownNode(lastChild).match(/^#([^\]]+)$/)

    if (match?.[1]) {
      node.children?.pop()
      trimTrailingWhitespace(node)

      return match[1]
    }
  }

  if (!node.children) {
    if (node.type !== 'text' || typeof node.value !== 'string') {
      return undefined
    }

    const match = node.value.match(customHeadingIdPattern)

    if (!match?.[1]) {
      return undefined
    }

    node.value = node.value.slice(0, match.index).trimEnd()

    return match[1]
  }

  for (let index = node.children.length - 1; index >= 0; index--) {
    const child = node.children[index]

    if (!child) {
      continue
    }

    const id = removeCustomHeadingId(child)

    if (!id) {
      continue
    }

    if (!flattenMarkdownNode(child).trim()) {
      node.children.splice(index, 1)
    }

    return id
  }

  return undefined
}

function normalizeStructuredContent(node: MarkdownNode) {
  return flattenMarkdownNode(node).replace(whitespacePattern, ' ').trim()
}

function restoreCanonicalHeadingIds(node: MarkdownRenderedNode | undefined) {
  if (!node) {
    return
  }

  if (node.tag && /^h[1-6]$/.test(node.tag)) {
    const canonicalId =
      node.props?.[canonicalHeadingIdProperty] ??
      node.props?.[canonicalHeadingIdPropertyName]

    if (typeof canonicalId === 'string' && canonicalId) {
      node.props = Object.fromEntries(
        Object.entries(node.props ?? {}).filter(([key]) => {
          return (
            key !== canonicalHeadingIdProperty &&
            key !== canonicalHeadingIdPropertyName
          )
        }),
      )
      node.props.id = canonicalId
    }
  }

  for (const child of node.children ?? []) {
    restoreCanonicalHeadingIds(child)
  }
}

function restoreCanonicalHeadingIdsCompiler(this: MarkdownProcessor) {
  const compile = this.Compiler

  if (!compile) {
    return
  }

  this.Compiler = (tree, file) => {
    const result = compile.call(this, tree, file)

    restoreCanonicalHeadingIds(result.body)
    restoreCanonicalHeadingIds(result.excerpt)

    return result
  }
}

export const remarkDocsMarkdownSemantics: MarkdownSemanticsPlugin = () => {
  const slugger = new GithubSlugger()

  return (tree: MarkdownRoot, file: MarkdownFile) => {
    const structuredData: MarkdownStructuredData = {
      headings: [],
      contents: [],
    }
    let currentHeading: string | undefined

    slugger.reset()

    function visit(node: MarkdownNode) {
      if (node.type === 'heading') {
        node.data ??= {}
        node.data.hProperties ??= {}

        const customId = removeCustomHeadingId(node)
        const content = normalizeStructuredContent(node)
        const existingId = node.data.hProperties.id
        const id =
          customId ??
          (typeof existingId === 'string' && existingId
            ? existingId
            : slugger.slug(content))

        node.data.hProperties.id = id
        node.data.hProperties[canonicalHeadingIdProperty] = id

        if (content) {
          structuredData.headings.push({ id, content })
          currentHeading = id
        }

        return
      }

      if (structuredBlockTypes.has(node.type)) {
        const content = normalizeStructuredContent(node)

        if (content) {
          structuredData.contents.push({
            heading: currentHeading,
            content,
          })
        }

        return
      }

      for (const child of node.children ?? []) {
        visit(child)
      }
    }

    visit(tree)

    file.data ??= {}
    file.data.structuredData = structuredData
  }
}

remarkDocsMarkdownSemantics.unified = {
  post(processor) {
    processor.use(restoreCanonicalHeadingIdsCompiler)

    return processor
  },
}

export default remarkDocsMarkdownSemantics
