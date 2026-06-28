const markdownSources = {
  ...import.meta.glob<string>('../../content/**/*.md', {
    query: '?raw',
    import: 'default',
  }),
  ...import.meta.glob<string>('../../content/**/*.mdx', {
    query: '?raw',
    import: 'default',
  }),
}
function normalizeDocsMarkdownSourcePath(value: string) {
  return value.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '') || 'index'
}

export async function readDocsMarkdownSource(sourcePath: string) {
  const normalized = normalizeDocsMarkdownSourcePath(sourcePath)
  const hasMarkdownExtension = /\.(?:md|mdx)$/i.test(normalized)
  const candidates = hasMarkdownExtension
    ? [`../../content/${normalized}`]
    : [`../../content/${normalized}.md`, `../../content/${normalized}.mdx`]
  const loader = candidates
    .map((candidate) => markdownSources[candidate])
    .find(Boolean)

  if (!loader) {
    throw new Error(`Markdown source not found: ${sourcePath}`)
  }

  return await loader()
}

export function readDocsFrontmatterBoolean(
  markdown: string,
  key: string,
): boolean | undefined {
  const match = /^---\r?\n(?<body>[\s\S]*?)\r?\n---/.exec(markdown)
  const body = match?.groups?.body

  if (!body) {
    return undefined
  }

  const line = body
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${key}:`))

  if (!line) {
    return undefined
  }

  const value = line.slice(key.length + 1).trim()

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return undefined
}
