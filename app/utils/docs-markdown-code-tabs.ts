type MarkdownNode = {
  type: string
  name?: string
  attributes?: Record<string, unknown>
  data?: {
    hName?: string
    hProperties?: Record<string, unknown>
  }
  children?: MarkdownNode[]
  lang?: string
  meta?: string
  value?: string
  position?: unknown
  [key: string]: unknown
}

type MarkdownRoot = MarkdownNode & {
  type: 'root'
  children: MarkdownNode[]
}

type MarkdownCodeTabsPlugin = {
  (): (tree: MarkdownRoot) => void
}

type CodeTabMeta = {
  groupId?: string
  rest: string
  value: string
}

type MetaToken = {
  name?: 'tab' | 'tab-group'
  raw: string
  value?: string
}

const tabComponentNames = new Set([
  'doc-tabs',
  'doc-tab',
  'DocTabs',
  'DocTab',
  'doc-code-tabs',
  'DocCodeTabs',
])

function tokenizeCodeMeta(meta: string): MetaToken[] {
  const tokens: MetaToken[] = []
  let index = 0

  while (index < meta.length) {
    while (/\s/.test(meta[index] ?? '')) {
      index++
    }

    if (index >= meta.length) {
      break
    }

    const start = index
    let quote: '"' | "'" | undefined

    while (index < meta.length) {
      const character = meta[index]

      if (quote) {
        if (character === '\\') {
          index += 2
          continue
        }

        if (character === quote) {
          quote = undefined
        }
      } else if (character === '"' || character === "'") {
        quote = character
      } else if (/\s/.test(character ?? '')) {
        break
      }

      index++
    }

    const raw = meta.slice(start, index)
    const attribute = raw.match(/^(tab|tab-group)(?:=(.*))?$/)

    if (!attribute?.[1]) {
      tokens.push({ raw })
      continue
    }

    const serializedValue = attribute[2]
    let value: string | undefined

    if (
      serializedValue &&
      ((serializedValue.startsWith('"') && serializedValue.endsWith('"')) ||
        (serializedValue.startsWith("'") && serializedValue.endsWith("'")))
    ) {
      value = serializedValue.slice(1, -1)
    }

    tokens.push({
      raw,
      name: attribute[1] as MetaToken['name'],
      ...(typeof value === 'string' ? { value } : {}),
    })
  }

  return tokens
}

function readCodeTabMeta(node: MarkdownNode): CodeTabMeta | undefined {
  if (node.type !== 'code' || typeof node.meta !== 'string') {
    return undefined
  }

  const tokens = tokenizeCodeMeta(node.meta)
  let tabValue: string | undefined
  let groupId: string | undefined

  for (const token of tokens) {
    if (token.name === 'tab') {
      tabValue = token.value || undefined
    }

    if (token.name === 'tab-group') {
      groupId = token.value || undefined
    }
  }

  if (!tabValue) {
    return undefined
  }

  return {
    value: tabValue,
    ...(groupId ? { groupId } : {}),
    rest: tokens
      .filter((token) => !token.name)
      .map((token) => token.raw)
      .join(' '),
  }
}

function createContainerComponent(
  name: string,
  attributes: Record<string, unknown>,
  children: MarkdownNode[],
): MarkdownNode {
  return {
    type: 'containerComponent',
    name,
    attributes,
    children,
  }
}

function createCodeTabs(nodes: MarkdownNode[], meta: CodeTabMeta[]) {
  const groupedNodes = new Map<string, MarkdownNode[]>()

  nodes.forEach((node, index) => {
    const currentMeta = meta[index]

    if (!currentMeta) {
      return
    }

    node.meta = currentMeta.rest

    const panelNodes = groupedNodes.get(currentMeta.value)

    if (panelNodes) {
      panelNodes.push(node)
    } else {
      groupedNodes.set(currentMeta.value, [node])
    }
  })

  const values = [...groupedNodes.keys()]
  const firstMeta = meta[0]
  const attributes: Record<string, unknown> = {
    defaultValue: values[0],
  }

  if (firstMeta?.groupId) {
    attributes.groupId = firstMeta.groupId
    attributes.persist = true
  }

  const triggers: MarkdownNode = {
    type: 'componentContainerSection',
    name: 'triggers',
    data: {
      hName: 'component-slot',
      hProperties: {
        'v-slot:triggers': '',
      },
    },
    children: values.map((value) =>
      createContainerComponent('doc-tab', { value, trigger: true }, []),
    ),
  }
  const panels = values.map((value) =>
    createContainerComponent(
      'doc-tab',
      { value },
      groupedNodes.get(value) ?? [],
    ),
  )

  return createContainerComponent('doc-tabs', attributes, [triggers, ...panels])
}

function transformMarkdownChildren(children: MarkdownNode[]) {
  let index = 0

  while (index < children.length) {
    const firstMeta = readCodeTabMeta(children[index] ?? { type: '' })

    if (!firstMeta) {
      index++
      continue
    }

    const meta = [firstMeta]
    let endIndex = index + 1

    while (endIndex < children.length) {
      const nextMeta = readCodeTabMeta(children[endIndex] ?? { type: '' })

      if (!nextMeta) {
        break
      }

      meta.push(nextMeta)
      endIndex++
    }

    const nodes = children.slice(index, endIndex)
    children.splice(index, nodes.length, createCodeTabs(nodes, meta))
    index++
  }

  for (const child of children) {
    if (tabComponentNames.has(child.name ?? '')) {
      continue
    }

    if (child.children) {
      transformMarkdownChildren(child.children)
    }
  }
}

export const remarkDocsMarkdownCodeTabs: MarkdownCodeTabsPlugin = () => {
  return (tree: MarkdownRoot) => {
    transformMarkdownChildren(tree.children)
  }
}

export default remarkDocsMarkdownCodeTabs
