import convert from 'npm-to-yarn'

type MarkdownNode = {
  type: string
  name?: string
  attributes?: Record<string, unknown>
  data?: Record<string, unknown>
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

type MarkdownPackageManagerPlugin = {
  (): (tree: MarkdownRoot) => void
}

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

const tabComponentNames = new Set([
  'doc-tabs',
  'doc-tab',
  'DocTabs',
  'DocTab',
  'doc-code-tabs',
  'DocCodeTabs',
])

const packageManagers: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun']

function convertCommand(command: string, manager: PackageManager) {
  if (manager === 'npm') return command

  return command
    .split('\n')
    .map((line) => convert(line, manager))
    .join('\n')
}

function authoredCommand(node: MarkdownNode) {
  if (node.lang === 'npm') return node.value ?? ''

  if (node.lang === 'package-install') {
    const value = node.value ?? ''
    return value.startsWith('npm') || value.startsWith('npx')
      ? value
      : `npm install ${value}`
  }

  return undefined
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

function createPackageManagerTabs(node: MarkdownNode, command: string) {
  const triggers: MarkdownNode = {
    type: 'componentContainerSection',
    name: 'triggers',
    data: {
      hName: 'component-slot',
      hProperties: { 'v-slot:triggers': '' },
    },
    children: packageManagers.map((manager) =>
      createContainerComponent(
        'doc-tab',
        { value: manager, trigger: true },
        [],
      ),
    ),
  }

  const panels = packageManagers.map((manager) =>
    createContainerComponent('doc-tab', { value: manager }, [
      {
        ...node,
        ...(node.data ? { data: { ...node.data } } : {}),
        lang: 'bash',
        value: convertCommand(command, manager),
      },
    ]),
  )

  return createContainerComponent(
    'doc-tabs',
    {
      defaultValue: 'npm',
      groupId: 'package-manager',
      persist: true,
    },
    [triggers, ...panels],
  )
}

function transformChildren(children: MarkdownNode[]) {
  for (let index = 0; index < children.length; index++) {
    const child = children[index]
    if (!child) continue

    const command = authoredCommand(child)
    if (command !== undefined) {
      children[index] = createPackageManagerTabs(child, command)
      continue
    }

    if (tabComponentNames.has(child.name ?? '')) continue
    if (child.children) transformChildren(child.children)
  }
}

export const remarkDocsMarkdownPackageManager: MarkdownPackageManagerPlugin =
  () => {
    return (tree) => {
      transformChildren(tree.children)
    }
  }

export default remarkDocsMarkdownPackageManager
