function parseArgs(argv) {
  const out = {
    minBytes: 1000,
  }

  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      continue
    }

    const [key, value = ''] = arg.slice(2).split('=')
    out[key] = value
  }

  out.minBytes = Number(out.minBytes || 1000)
  out.contains = String(out.contains || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  return out
}

function usage() {
  return [
    'Usage:',
    '  node scripts/parity-smoke.mjs --url=http://127.0.0.1:3000/guide/component-detail --selector=#nd-toc --contains=.docs-toc-link,.docs-toc-popover',
    '',
    'Options:',
    '  --url=http://127.0.0.1:3000/page',
    '  --selector=#nd-toc',
    '  --contains=.class,#id,tag',
    '  --minBytes=1000',
  ].join('\n')
}

function tokenForSelector(selector) {
  if (selector.startsWith('#')) {
    return `id="${selector.slice(1)}"`
  }

  if (selector.startsWith('.')) {
    return selector.slice(1)
  }

  return `<${selector}`
}

function countOccurrences(text, token) {
  let count = 0
  let index = text.indexOf(token)

  while (index !== -1) {
    count += 1
    index = text.indexOf(token, index + token.length)
  }

  return count
}

function addCheck(checks, check) {
  checks.push(check)
}

function formatReport(report) {
  const failed = report.checks.filter((check) => !check.pass)
  const lines = [
    `Parity smoke: ${report.url}`,
    `Status: ${report.status.toUpperCase()}`,
    `Checks: ${report.checks.length - failed.length}/${report.checks.length} passed`,
  ]

  if (failed.length > 0) {
    lines.push('', 'Failed checks:')

    for (const check of failed) {
      lines.push(`- ${check.label}: ${check.message}`)
    }
  }

  return lines.join('\n')
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (!options.url) {
    console.error(usage())
    process.exitCode = 1
    return
  }

  const checks = []
  let response
  let body = ''

  try {
    response = await fetch(options.url)
    body = await response.text()
  } catch (error) {
    addCheck(checks, {
      label: 'fetch local url',
      pass: false,
      message: error instanceof Error ? error.message : String(error),
    })

    const report = { url: options.url, status: 'fail', checks }
    console.log(formatReport(report))
    process.exitCode = 1
    return
  }

  addCheck(checks, {
    label: 'http 200',
    pass: response.ok,
    message: `received ${response.status}`,
  })

  addCheck(checks, {
    label: 'minimum html size',
    pass: body.length >= options.minBytes,
    message: `received ${body.length} bytes, expected at least ${options.minBytes}`,
  })

  if (options.selector) {
    const token = tokenForSelector(options.selector)
    const count = countOccurrences(body, token)

    addCheck(checks, {
      label: `selector ${options.selector}`,
      pass: count > 0,
      message: `token ${JSON.stringify(token)} occurred ${count} time(s)`,
    })
  }

  for (const selector of options.contains) {
    const token = tokenForSelector(selector)
    const count = countOccurrences(body, token)

    addCheck(checks, {
      label: `contains ${selector}`,
      pass: count > 0,
      message: `token ${JSON.stringify(token)} occurred ${count} time(s)`,
    })
  }

  const status = checks.every((check) => check.pass) ? 'pass' : 'fail'
  const report = { url: options.url, status, checks }

  console.log(formatReport(report))

  if (status !== 'pass') {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
