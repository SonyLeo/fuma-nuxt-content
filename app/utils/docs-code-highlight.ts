type HighlightKind =
  | 'attr'
  | 'command'
  | 'comment'
  | 'function'
  | 'keyword'
  | 'number'
  | 'punctuation'
  | 'string'
  | 'tag'

type HighlightToken = {
  text: string
  style?: Record<string, string>
}

export type HighlightedCodeLine = {
  key: string
  tokens: HighlightToken[]
}

const tokenColors: Record<HighlightKind, { light: string; dark: string }> = {
  attr: { light: '#1e66f5', dark: '#89b4fa' },
  command: { light: '#1e66f5', dark: '#89b4fa' },
  comment: { light: '#6c6f85', dark: '#9399b2' },
  function: { light: '#209fb5', dark: '#94e2d5' },
  keyword: { light: '#8839ef', dark: '#cba6f7' },
  number: { light: '#fe640b', dark: '#fab387' },
  punctuation: { light: '#7c7f93', dark: '#a6adc8' },
  string: { light: '#40a02b', dark: '#a6e3a1' },
  tag: { light: '#8839ef', dark: '#cba6f7' },
}

const languageAliases: Record<string, 'markup' | 'script' | 'shell'> = {
  bash: 'shell',
  html: 'markup',
  javascript: 'script',
  js: 'script',
  jsx: 'script',
  shell: 'shell',
  shellscript: 'shell',
  sh: 'shell',
  ts: 'script',
  tsx: 'script',
  typescript: 'script',
  vue: 'markup',
  zsh: 'shell',
}

const scriptKeywords = new Set([
  'as',
  'async',
  'await',
  'break',
  'const',
  'continue',
  'else',
  'export',
  'false',
  'for',
  'from',
  'function',
  'if',
  'import',
  'in',
  'interface',
  'let',
  'new',
  'null',
  'return',
  'true',
  'type',
  'undefined',
])

export function createHighlightedCodeLines(
  code: string,
  language?: string,
): HighlightedCodeLine[] {
  const normalizedCode = code.replace(/\r\n?/g, '\n')
  const lines = normalizedCode.length > 0 ? normalizedCode.split('\n') : ['']
  const mode = resolveLanguageMode(language)

  return lines.map((line, index) => ({
    key: `${index}:${line.length}:${line}`,
    tokens: tokenizeLine(line, mode),
  }))
}

function resolveLanguageMode(language?: string) {
  const normalized = language?.trim().toLowerCase()

  return normalized ? languageAliases[normalized] : undefined
}

function tokenizeLine(
  line: string,
  mode?: 'markup' | 'script' | 'shell',
): HighlightToken[] {
  if (mode === 'markup') {
    return tokenizeMarkupLine(line)
  }

  if (mode === 'shell') {
    return tokenizeShellLine(line)
  }

  if (mode === 'script') {
    return tokenizeScriptLine(line)
  }

  return [{ text: line }]
}

function createToken(text: string, kind?: HighlightKind): HighlightToken {
  if (!text) {
    return { text }
  }

  if (!kind) {
    return { text }
  }

  const color = tokenColors[kind]

  return {
    text,
    style: {
      '--shiki-dark': color.dark,
      '--shiki-light': color.light,
    },
  }
}

function readWhile(
  source: string,
  start: number,
  predicate: (character: string) => boolean,
) {
  let index = start

  while (index < source.length && predicate(source[index] ?? '')) {
    index++
  }

  return index
}

function tokenizeMarkupLine(line: string): HighlightToken[] {
  const tokens: HighlightToken[] = []
  let index = 0
  let inTag = false

  while (index < line.length) {
    const rest = line.slice(index)

    if (rest.startsWith('<!--')) {
      const end = line.indexOf('-->', index + 4)
      const nextIndex = end === -1 ? line.length : end + 3

      tokens.push(createToken(line.slice(index, nextIndex), 'comment'))
      index = nextIndex
      continue
    }

    const character = line[index] ?? ''

    if (/\s/.test(character)) {
      const nextIndex = readWhile(line, index, (value) => /\s/.test(value))

      tokens.push(createToken(line.slice(index, nextIndex)))
      index = nextIndex
      continue
    }

    if (character === '<') {
      tokens.push(createToken(character, 'punctuation'))
      index++
      inTag = true

      if (line[index] === '/') {
        tokens.push(createToken('/', 'punctuation'))
        index++
      }

      const nextIndex = readWhile(line, index, (value) => /[\w:.-]/.test(value))

      if (nextIndex > index) {
        tokens.push(createToken(line.slice(index, nextIndex), 'tag'))
        index = nextIndex
      }

      continue
    }

    if (inTag && rest.startsWith('/>')) {
      tokens.push(createToken('/>', 'punctuation'))
      index += 2
      inTag = false
      continue
    }

    if (inTag && character === '>') {
      tokens.push(createToken(character, 'punctuation'))
      index++
      inTag = false
      continue
    }

    if (inTag && character === '=') {
      tokens.push(createToken(character, 'punctuation'))
      index++
      continue
    }

    if (inTag && (character === '"' || character === "'")) {
      const quote = character
      let nextIndex = index + 1

      while (nextIndex < line.length) {
        if (line[nextIndex] === quote && line[nextIndex - 1] !== '\\') {
          nextIndex++
          break
        }

        nextIndex++
      }

      tokens.push(createToken(line.slice(index, nextIndex), 'string'))
      index = nextIndex
      continue
    }

    if (inTag && /[:@#\w.-]/.test(character)) {
      const nextIndex = readWhile(line, index, (value) =>
        /[:@#\w.-]/.test(value),
      )

      tokens.push(createToken(line.slice(index, nextIndex), 'attr'))
      index = nextIndex
      continue
    }

    if (rest.startsWith('{{') || rest.startsWith('}}')) {
      tokens.push(createToken(rest.slice(0, 2), 'punctuation'))
      index += 2
      continue
    }

    tokens.push(createToken(character))
    index++
  }

  return tokens
}

function tokenizeShellLine(line: string): HighlightToken[] {
  const commentIndex = line.search(/(^|\s)#/)
  const tokens: HighlightToken[] = []
  const commandLine = commentIndex === -1 ? line : line.slice(0, commentIndex)
  let index = 0
  let seenCommand = false

  while (index < commandLine.length) {
    const character = commandLine[index] ?? ''

    if (/\s/.test(character)) {
      const nextIndex = readWhile(commandLine, index, (value) => /\s/.test(value))

      tokens.push(createToken(commandLine.slice(index, nextIndex)))
      index = nextIndex
      continue
    }

    if (character === '"' || character === "'") {
      const quote = character
      let nextIndex = index + 1

      while (nextIndex < commandLine.length) {
        if (
          commandLine[nextIndex] === quote &&
          commandLine[nextIndex - 1] !== '\\'
        ) {
          nextIndex++
          break
        }

        nextIndex++
      }

      tokens.push(createToken(commandLine.slice(index, nextIndex), 'string'))
      index = nextIndex
      continue
    }

    const nextIndex = readWhile(commandLine, index, (value) => !/\s/.test(value))
    const word = commandLine.slice(index, nextIndex)

    if (!seenCommand) {
      tokens.push(createToken(word, 'command'))
      seenCommand = true
    } else if (word.startsWith('-')) {
      tokens.push(createToken(word, 'keyword'))
    } else {
      tokens.push(createToken(word))
    }

    index = nextIndex
  }

  if (commentIndex !== -1) {
    tokens.push(createToken(line.slice(commentIndex), 'comment'))
  }

  return tokens
}

function tokenizeScriptLine(line: string): HighlightToken[] {
  const tokens: HighlightToken[] = []
  let index = 0

  while (index < line.length) {
    const rest = line.slice(index)
    const character = line[index] ?? ''

    if (rest.startsWith('//')) {
      tokens.push(createToken(rest, 'comment'))
      break
    }

    if (/\s/.test(character)) {
      const nextIndex = readWhile(line, index, (value) => /\s/.test(value))

      tokens.push(createToken(line.slice(index, nextIndex)))
      index = nextIndex
      continue
    }

    if (character === '"' || character === "'" || character === '`') {
      const quote = character
      let nextIndex = index + 1

      while (nextIndex < line.length) {
        if (line[nextIndex] === quote && line[nextIndex - 1] !== '\\') {
          nextIndex++
          break
        }

        nextIndex++
      }

      tokens.push(createToken(line.slice(index, nextIndex), 'string'))
      index = nextIndex
      continue
    }

    if (/\d/.test(character)) {
      const nextIndex = readWhile(line, index, (value) => /[\d._]/.test(value))

      tokens.push(createToken(line.slice(index, nextIndex), 'number'))
      index = nextIndex
      continue
    }

    if (/[A-Za-z_$]/.test(character)) {
      const nextIndex = readWhile(line, index, (value) => /[\w$]/.test(value))
      const word = line.slice(index, nextIndex)
      const nextNonSpace = line.slice(nextIndex).match(/\S/)?.[0]

      tokens.push(
        createToken(
          word,
          scriptKeywords.has(word)
            ? 'keyword'
            : nextNonSpace === '('
              ? 'function'
              : undefined,
        ),
      )
      index = nextIndex
      continue
    }

    tokens.push(
      createToken(
        character,
        /[{}()[\].,;:=<>/+*-]/.test(character)
          ? 'punctuation'
          : undefined,
      ),
    )
    index++
  }

  return tokens
}
