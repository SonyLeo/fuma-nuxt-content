export const DEFAULT_CHROME_PATH =
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

export function parseArgs(argv) {
  const out = {
    chromePath: DEFAULT_CHROME_PATH,
    chromePort: 9233,
    dump: false,
    minBytes: 1000,
    profile: '',
    retries: 0,
    selector: '',
    settleMs: 1200,
    suite: '',
    url: '',
    viewports: ['1440x1000', '994x935'],
  }

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]

    if (!arg.startsWith('--')) {
      continue
    }

    const raw = arg.slice(2)
    const [key, inlineValue] = raw.split('=')
    const value =
      inlineValue ?? (argv[index + 1]?.startsWith('--') ? '' : argv[++index] ?? '')

    out[key] = value
  }

  out.chromePort = Number(out.chromePort || 9233)
  out.dump =
    out.dump === true ||
    out.dump === '' ||
    out.dump === 'true' ||
    (typeof out.dump === 'string' &&
    out.dump.length > 0 &&
    out.dump !== 'false'
      ? out.dump
      : false)
  out.minBytes = Number(out.minBytes || 1000)
  out.retries = Number(out.retries || 0)
  out.settleMs = Number(out.settleMs || 1200)
  out.viewports = String(out.viewports || '1440x1000,994x935')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  return out
}

export function parseViewport(value) {
  const match = /^(?<width>\d+)x(?<height>\d+)$/.exec(value)

  if (!match?.groups) {
    throw new Error(`Invalid viewport: ${value}`)
  }

  return {
    width: Number(match.groups.width),
    height: Number(match.groups.height),
  }
}

export function usage({ profiles, suites }) {
  return [
    'Usage:',
    '  node scripts/parity/run.mjs --profile=callout --url=http://127.0.0.1:8888/guide/components',
    '  node scripts/parity/run.mjs --suite=content-components --url=http://127.0.0.1:8888/guide/components',
    '  node scripts/parity/run.mjs --suite=full-regression',
    '',
    'Options:',
    `  --profile=${profiles.join('|')}`,
    `  --suite=${suites.join('|')}`,
    '  --url=http://127.0.0.1:8888/guide/components',
    '    Do not use --url with --suite=full-regression; that suite uses per-profile fixtures.',
    '  --viewports=1440x1000,994x935',
    '  --chromePath=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    '  --chromePort=9233',
    '  --retries=0',
    '  --settleMs=1200',
    '  --dump or --dump=.parity/artifacts',
    '  --mutation=callout-broken-layout',
  ].join('\n')
}
