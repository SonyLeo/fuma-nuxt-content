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

type MarkdownStepsPlugin = {
  (): (tree: MarkdownRoot) => void
}

type StepHeadingSyntax = {
  marker: boolean
  number?: number
}

const docStepsComponentName = 'doc-steps'
const docStepComponentName = 'doc-step'
const stepComponentNames = new Set([
  docStepsComponentName,
  docStepComponentName,
  'DocSteps',
  'DocStep',
])
const dataFdStepProperty = 'data-fd-step'
const dataFdStepPropertyName = 'dataFdStep'
const numberedStepPattern = /^([1-9]\d*)\. (.*)$/
const terminalStepMarkerPattern = /\s*\[step]\s*$/

function flattenMarkdownNode(node: MarkdownNode): string {
  if (node.type === 'image' || node.type === 'imageReference') {
    return ''
  }

  if (node.children) {
    return node.children.map(flattenMarkdownNode).join('')
  }

  return typeof node.value === 'string' ? node.value : ''
}

function readLeadingStepNumber(node: MarkdownNode) {
  const firstChild = node.children?.[0]

  if (firstChild?.type !== 'text' || typeof firstChild.value !== 'string') {
    return undefined
  }

  const match = firstChild.value.match(numberedStepPattern)

  if (!match?.[1]) {
    return undefined
  }

  return {
    number: Number(match[1]),
    replacement: match[2] ?? '',
  }
}

function isEmptySpanTextComponent(node: MarkdownNode) {
  return (
    node.type === 'textComponent' &&
    node.name === 'span' &&
    Object.keys(node.attributes ?? {}).length === 0
  )
}

function isWhitespaceTextWrapper(node: MarkdownNode): boolean {
  if (!isEmptySpanTextComponent(node)) {
    return false
  }

  return (node.children ?? []).every((child) => {
    if (child.type === 'text' && typeof child.value === 'string') {
      return child.value.trim() === ''
    }

    return isWhitespaceTextWrapper(child)
  })
}

function trimTerminalMarkerWhitespace(node: MarkdownNode) {
  while (node.children?.length) {
    const lastChild = node.children.at(-1)

    if (!lastChild) {
      return
    }

    if (lastChild.type === 'text' && typeof lastChild.value === 'string') {
      lastChild.value = lastChild.value.trimEnd()

      if (!lastChild.value) {
        node.children.pop()
        continue
      }

      return
    }

    if (isWhitespaceTextWrapper(lastChild)) {
      node.children.pop()
      continue
    }

    return
  }
}

function hasTerminalStepMarker(node: MarkdownNode) {
  const lastChild = node.children?.at(-1)

  if (!lastChild) {
    return false
  }

  if (isEmptySpanTextComponent(lastChild)) {
    return flattenMarkdownNode(lastChild) === 'step'
  }

  return (
    lastChild.type === 'text' &&
    typeof lastChild.value === 'string' &&
    terminalStepMarkerPattern.test(lastChild.value)
  )
}

function readStepHeadingSyntax(
  node: MarkdownNode,
): StepHeadingSyntax | undefined {
  if (node.type !== 'heading') {
    return undefined
  }

  const leadingNumber = readLeadingStepNumber(node)
  const marker = hasTerminalStepMarker(node)

  if (!leadingNumber && !marker) {
    return undefined
  }

  return {
    marker,
    ...(leadingNumber ? { number: leadingNumber.number } : {}),
  }
}

function flattenHeadingAfterCleanup(
  node: MarkdownNode,
  cleanup: { marker: boolean; number: boolean },
) {
  return (node.children ?? [])
    .map((child, index, children) => {
      const isFirst = index === 0
      const isLast = index === children.length - 1

      if (cleanup.marker && isLast && isEmptySpanTextComponent(child)) {
        return flattenMarkdownNode(child) === 'step'
          ? ''
          : flattenMarkdownNode(child)
      }

      if (child.type === 'text' && typeof child.value === 'string') {
        let value = child.value

        if (cleanup.number && isFirst) {
          value = value.match(numberedStepPattern)?.[2] ?? value
        }

        if (cleanup.marker && isLast) {
          value = value.replace(terminalStepMarkerPattern, '')
        }

        return value
      }

      return flattenMarkdownNode(child)
    })
    .join('')
    .trim()
}

function hasHeadingContentAfterCleanup(
  node: MarkdownNode,
  cleanup: { marker: boolean; number: boolean },
) {
  return flattenHeadingAfterCleanup(node, cleanup).length > 0
}

function removeLeadingStepNumber(node: MarkdownNode) {
  const firstChild = node.children?.[0]

  if (firstChild?.type !== 'text' || typeof firstChild.value !== 'string') {
    return
  }

  const replacement = readLeadingStepNumber(node)?.replacement

  if (typeof replacement === 'undefined') {
    return
  }

  firstChild.value = replacement

  if (!firstChild.value) {
    node.children?.shift()
  }
}

function removeTerminalStepMarker(node: MarkdownNode) {
  const lastChild = node.children?.at(-1)

  if (!lastChild) {
    return
  }

  if (isEmptySpanTextComponent(lastChild)) {
    if (flattenMarkdownNode(lastChild) === 'step') {
      node.children?.pop()
      trimTerminalMarkerWhitespace(node)
    }

    return
  }

  if (lastChild.type !== 'text' || typeof lastChild.value !== 'string') {
    return
  }

  lastChild.value = lastChild.value.replace(terminalStepMarkerPattern, '')
  trimTerminalMarkerWhitespace(node)
}

function hasDataFdStep(node: MarkdownNode) {
  return (
    typeof node.data?.hProperties?.[dataFdStepProperty] !== 'undefined' ||
    typeof node.data?.hProperties?.[dataFdStepPropertyName] !== 'undefined' ||
    typeof node.attributes?.[dataFdStepProperty] !== 'undefined' ||
    typeof node.attributes?.[dataFdStepPropertyName] !== 'undefined'
  )
}

function markStepHeading(node: MarkdownNode, step: number) {
  node.data ??= {}
  node.data.hProperties ??= {}
  node.data.hProperties[dataFdStepProperty] = step
}

function shouldSkipChildTraversal(node: MarkdownNode) {
  return node.type === 'heading' || stepComponentNames.has(node.name ?? '')
}

function createContainerComponent(name: string, children: MarkdownNode[]) {
  return {
    type: 'containerComponent',
    name,
    children,
  } satisfies MarkdownNode
}

function createStepsContainer(nodes: MarkdownNode[]) {
  const firstHeading = nodes[0]
  const depth = firstHeading?.depth
  const steps: MarkdownNode[] = []
  let currentStepChildren: MarkdownNode[] | undefined

  for (const node of nodes) {
    if (
      node.type === 'heading' &&
      node.depth === depth &&
      hasDataFdStep(node)
    ) {
      currentStepChildren = [node]
      steps.push(
        createContainerComponent(docStepComponentName, currentStepChildren),
      )
      continue
    }

    currentStepChildren?.push(node)
  }

  for (const step of steps) {
    const children = step.children

    if (children) {
      transformMarkdownChildren(children)
    }
  }

  return createContainerComponent(docStepsComponentName, steps)
}

function acceptStepHeading(node: MarkdownNode, expectedStep: number) {
  const syntax = readStepHeadingSyntax(node)

  if (!syntax) {
    return false
  }

  const removeNumber = syntax.number === expectedStep
  const accepted = syntax.marker || removeNumber

  if (
    !accepted ||
    !hasHeadingContentAfterCleanup(node, {
      marker: syntax.marker,
      number: removeNumber,
    })
  ) {
    return false
  }

  if (syntax.marker) {
    removeTerminalStepMarker(node)
  }

  if (removeNumber) {
    removeLeadingStepNumber(node)
  }

  markStepHeading(node, expectedStep)

  return true
}

function transformMarkdownChildren(children: MarkdownNode[]) {
  let startIndex = -1
  let startDepth: number | undefined
  let expectedStep = 1
  let index = 0

  function closeSequence(endIndex: number) {
    if (startIndex === -1) {
      return -1
    }

    const sequenceNodes = children.slice(startIndex, endIndex)
    const replacementIndex = startIndex
    const stepsContainer = createStepsContainer(sequenceNodes)

    children.splice(startIndex, sequenceNodes.length, stepsContainer)
    startIndex = -1
    startDepth = undefined
    expectedStep = 1

    return replacementIndex
  }

  while (index < children.length) {
    const node = children[index]

    if (!node || node.type !== 'heading' || hasDataFdStep(node)) {
      index++
      continue
    }

    if (startIndex !== -1 && typeof startDepth === 'number') {
      const depth = node.depth ?? 1

      if (depth < startDepth) {
        index = closeSequence(index) + 1
        continue
      }

      if (depth > startDepth) {
        index++
        continue
      }

      if (acceptStepHeading(node, expectedStep)) {
        expectedStep++
        index++
        continue
      }

      index = closeSequence(index) + 2
      continue
    }

    if (acceptStepHeading(node, expectedStep)) {
      startIndex = index
      startDepth = node.depth ?? 1
      expectedStep++
    }

    index++
  }

  closeSequence(children.length)

  for (const child of children) {
    if (shouldSkipChildTraversal(child)) {
      continue
    }

    if (child.children) {
      transformMarkdownChildren(child.children)
    }
  }
}

export const remarkDocsMarkdownSteps: MarkdownStepsPlugin = () => {
  return (tree: MarkdownRoot) => {
    transformMarkdownChildren(tree.children)
  }
}

export default remarkDocsMarkdownSteps
