import { defineConfig } from '@nuxtjs/mdc/config'
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers'

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

const codeWordNotationPattern =
  /^(?:\/\/|#|<!--|\/\*)?\s*\[!code word:((?:\\.|[^:\]])+)(?::(\d+))?\]\s*(?:-->|\*\/)?$/
const escapedCharacterPattern = /\\(.)/g

function isElement(node: HastNode | undefined): node is HastElement {
  return node?.type === 'element'
}

function isText(node: HastNode | undefined): node is HastText {
  return node?.type === 'text'
}

function getClassList(node: HastElement) {
  const className = node.properties?.className

  if (Array.isArray(className)) {
    return className.map(String)
  }

  if (typeof className === 'string') {
    return className.split(/\s+/).filter(Boolean)
  }

  return []
}

function addClass(node: HastElement, className: string) {
  const classes = new Set(getClassList(node))
  classes.add(className)

  node.properties ??= {}
  node.properties.className = Array.from(classes)
}

function getNodeText(node: HastNode): string {
  if (isText(node)) {
    return node.value
  }

  if (isElement(node)) {
    return (node.children ?? []).map(getNodeText).join('')
  }

  return ''
}

function isLineElement(node: HastNode | undefined): node is HastElement {
  return isElement(node) && getClassList(node).includes('line')
}

function createHighlightedWordNode(value: string): HastElement {
  return {
    type: 'element',
    tagName: 'span',
    properties: {
      className: ['highlighted-word'],
    },
    children: [{ type: 'text', value }],
  }
}

function highlightWordInNode(node: HastNode, word: string): HastNode[] {
  if (!word) {
    return [node]
  }

  if (isText(node)) {
    const parts: HastNode[] = []
    let index = 0
    let matchIndex = node.value.indexOf(word, index)

    while (matchIndex !== -1) {
      if (matchIndex > index) {
        parts.push({ type: 'text', value: node.value.slice(index, matchIndex) })
      }

      parts.push(createHighlightedWordNode(word))
      index = matchIndex + word.length
      matchIndex = node.value.indexOf(word, index)
    }

    if (index < node.value.length) {
      parts.push({ type: 'text', value: node.value.slice(index) })
    }

    return parts.length > 0 ? parts : [node]
  }

  if (isElement(node) && node.children) {
    node.children = node.children.flatMap((child) =>
      highlightWordInNode(child, word),
    )
  }

  return [node]
}

function transformerFumadocsWordHighlightFallback() {
  return {
    name: 'fuma-nuxt-content:word-highlight-fallback',
    code(code: HastElement) {
      const children = code.children
      if (!children) {
        return code
      }

      const lineEntries = children
        .map((child, index) => ({ child, index }))
        .filter((entry) => isLineElement(entry.child))
      const directives: Array<{
        index: number
        lineIndex: number
        word: string
        range: number
      }> = []

      for (const entry of lineEntries) {
        const match = getNodeText(entry.child).trim().match(codeWordNotationPattern)

        if (!match) {
          continue
        }

        directives.push({
          index: entry.index,
          lineIndex: lineEntries.indexOf(entry),
          word: match[1].replace(escapedCharacterPattern, '$1'),
          range: match[2] ? Number(match[2]) : Number.POSITIVE_INFINITY,
        })
      }

      for (const directive of directives) {
        const end = Math.min(
          lineEntries.length,
          directive.lineIndex + 1 + directive.range,
        )

        for (let i = directive.lineIndex + 1; i < end; i++) {
          const line = lineEntries[i]?.child
          if (line?.children) {
            line.children = line.children.flatMap((child) =>
              highlightWordInNode(child, directive.word),
            )
          }
        }
      }

      for (const directive of [...directives].reverse()) {
        children.splice(directive.index, 1)
      }

      if (directives.length > 0) {
        addClass(code, 'has-highlighted-word')
      }

      return code
    },
  }
}

export default defineConfig({
  shiki: {
    transformers: [
      transformerNotationHighlight({
        matchAlgorithm: 'v3',
      }),
      transformerNotationWordHighlight({
        matchAlgorithm: 'v3',
      }),
      transformerNotationDiff({
        matchAlgorithm: 'v3',
      }),
      transformerNotationFocus({
        matchAlgorithm: 'v3',
      }),
      transformerFumadocsWordHighlightFallback(),
    ],
  },
})
