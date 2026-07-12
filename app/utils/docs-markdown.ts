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
