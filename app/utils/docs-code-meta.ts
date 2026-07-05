export type DocsCodeBlockMeta = {
  attributes: Record<string, string | true>
  icon?: string
  keepBackground: boolean
  lineNumbers: boolean
  lineNumbersStart: number
  rest: string
  title?: string
}

const codeMetaAttributePattern =
  /(^|\s)([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g

function readAttributeValue(
  doubleQuoted?: string,
  singleQuoted?: string,
  bare?: string,
) {
  return doubleQuoted ?? singleQuoted ?? bare ?? true
}

function readBooleanAttribute(value: string | true | undefined) {
  if (value === undefined) {
    return false
  }

  if (value === true) {
    return true
  }

  return !['false', '0', 'off'].includes(value.toLowerCase())
}

function readNumberAttribute(value: string | true | undefined, fallback = 1) {
  if (typeof value !== 'string') {
    return fallback
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : fallback
}

export function parseDocsCodeBlockMeta(meta?: string): DocsCodeBlockMeta {
  const attributes: Record<string, string | true> = {}
  const raw = meta ?? ''
  const rest = raw
    .replace(
      codeMetaAttributePattern,
      (
        match,
        prefix: string,
        name: string,
        doubleQuoted?: string,
        singleQuoted?: string,
        bare?: string,
      ) => {
        const normalized = name.toLowerCase()

        if (
          ![
            'filename',
            'icon',
            'keep-background',
            'keepbackground',
            'linenumbers',
            'line-numbers',
            'title',
          ].includes(normalized)
        ) {
          return match
        }

        attributes[name] = readAttributeValue(doubleQuoted, singleQuoted, bare)

        return prefix
      },
    )
    .replace(/\s+/g, ' ')
    .trim()

  const lineNumbersValue =
    attributes.lineNumbers ?? attributes['line-numbers']
  const lineNumbers = readBooleanAttribute(lineNumbersValue)
  const lineNumbersStart = Math.max(1, readNumberAttribute(lineNumbersValue, 1))
  const title =
    typeof attributes.title === 'string'
      ? attributes.title
      : typeof attributes.filename === 'string'
        ? attributes.filename
        : undefined
  const icon = typeof attributes.icon === 'string' ? attributes.icon : undefined
  const keepBackground = readBooleanAttribute(
    attributes.keepBackground ?? attributes['keep-background'],
  )

  return {
    attributes,
    icon,
    keepBackground,
    lineNumbers,
    lineNumbersStart,
    rest,
    title,
  }
}
