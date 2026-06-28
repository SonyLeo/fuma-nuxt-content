import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const DEFAULT_CHROME_PATH =
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

function parseArgs(argv) {
  const out = {
    selector: '#nd-toc',
    port: 9223,
    viewports: ['1440x1000', '994x1000'],
  }

  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      continue
    }

    const [key, value = ''] = arg.slice(2).split('=')
    out[key] = value
  }

  out.port = Number(out.port || 9223)
  out.viewports = String(out.viewports || '1440x1000')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  return out
}

function usage() {
  return [
    'Usage:',
    '  node scripts/parity-extract.mjs --reference=https://example.com --local=http://127.0.0.1:3000/page --selector=#nd-toc',
    '',
    'Options:',
    '  --viewports=1440x1000,994x1000',
    '  --port=9223',
    '  --out=tmp/parity.json',
    '  --chromePath=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ].join('\n')
}

function parseViewport(value) {
  const match = /^(?<width>\d+)x(?<height>\d+)$/.exec(value)

  if (!match?.groups) {
    throw new Error(`Invalid viewport: ${value}`)
  }

  return {
    width: Number(match.groups.width),
    height: Number(match.groups.height),
  }
}

async function waitForChrome(port, attempts = 20) {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`)

      if (response.ok) {
        return true
      }
    } catch {
      // Chrome is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  return false
}

async function ensureChrome(options) {
  if (await waitForChrome(options.port, 2)) {
    return
  }

  const chromePath =
    options.chromePath || process.env.CHROME_PATH || DEFAULT_CHROME_PATH

  if (!existsSync(chromePath)) {
    throw new Error(`Chrome executable not found: ${chromePath}`)
  }

  const profile = join(tmpdir(), 'codex-chrome-parity-profile')
  const child = spawn(
    chromePath,
    [
      '--headless=new',
      `--remote-debugging-port=${options.port}`,
      `--user-data-dir=${profile}`,
      '--disable-gpu',
      '--window-size=1440,1000',
      'about:blank',
    ],
    {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    },
  )

  child.unref()

  if (!(await waitForChrome(options.port))) {
    throw new Error(`Chrome did not start on port ${options.port}`)
  }
}

async function connectCdp(webSocketDebuggerUrl) {
  const ws = new WebSocket(webSocketDebuggerUrl)

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })

  let id = 0
  const pending = new Map()

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)

    if (!message.id || !pending.has(message.id)) {
      return
    }

    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)

    if (message.error) {
      reject(new Error(JSON.stringify(message.error)))
      return
    }

    resolve(message.result)
  })

  return {
    send(method, params = {}) {
      const callId = ++id
      ws.send(JSON.stringify({ id: callId, method, params }))

      return new Promise((resolve, reject) => {
        pending.set(callId, { resolve, reject })
      })
    },
    close() {
      ws.close()
    },
  }
}

async function openPage(options, url, viewport) {
  const tab = await fetch(
    `http://127.0.0.1:${options.port}/json/new?${encodeURIComponent('about:blank')}`,
    { method: 'PUT' },
  ).then((response) => response.json())
  const cdp = await connectCdp(tab.webSocketDebuggerUrl)

  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await cdp.send('Page.navigate', { url })
  await new Promise((resolve) => setTimeout(resolve, 3500))

  return cdp
}

function createExtractor(selector) {
  return `(() => {
    const selector = ${JSON.stringify(selector)};
    const pick = (element) => {
      if (!element) return null;

      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return {
        tag: element.tagName.toLowerCase(),
        id: element.id || null,
        className: typeof element.className === 'string' ? element.className : '',
        text: element.textContent?.trim().replace(/\\s+/g, ' ').slice(0, 160) || '',
        rect: {
          x: Math.round(rect.x * 100) / 100,
          y: Math.round(rect.y * 100) / 100,
          width: Math.round(rect.width * 100) / 100,
          height: Math.round(rect.height * 100) / 100,
        },
        style: {
          display: style.display,
          position: style.position,
          gridArea: style.gridArea,
          top: style.top,
          width: style.width,
          height: style.height,
          maxHeight: style.maxHeight,
          overflow: style.overflow,
          padding: style.padding,
          margin: style.margin,
          gap: style.gap,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          color: style.color,
          backgroundColor: style.backgroundColor,
          border: style.border,
        },
      };
    };

    const root = document.querySelector(selector);
    const title = document.querySelector('#toc-title');
    const list =
      root?.querySelector('.docs-toc-list') ||
      root?.querySelector('.relative.flex.flex-col') ||
      root?.querySelector('ul') ||
      root?.querySelector('nav') ||
      null;
    const scroll =
      root?.querySelector('.docs-toc-list-shell') ||
      root?.querySelector('[data-radix-scroll-area-viewport]') ||
      null;
    const popover = document.querySelector('.docs-toc-popover, [data-toc-popover]');
    const popoverTrigger = document.querySelector('.docs-toc-popover-trigger, [data-toc-popover-trigger]');
    const links = [...(root?.querySelectorAll('a') || [])].slice(0, 12).map((anchor) => {
      const style = getComputedStyle(anchor);
      const rect = anchor.getBoundingClientRect();

      return {
        text: anchor.textContent?.trim().replace(/\\s+/g, ' ') || '',
        href: anchor.getAttribute('href'),
        active: anchor.matches('.is-active,[data-active="true"],[aria-current],[aria-selected="true"]'),
        rect: {
          x: Math.round(rect.x * 100) / 100,
          y: Math.round(rect.y * 100) / 100,
          width: Math.round(rect.width * 100) / 100,
          height: Math.round(rect.height * 100) / 100,
        },
        style: {
          display: style.display,
          minHeight: style.minHeight,
          padding: style.padding,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
          paddingTop: style.paddingTop,
          paddingBottom: style.paddingBottom,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          color: style.color,
        },
      };
    });

    return {
      url: location.href,
      viewport: { width: innerWidth, height: innerHeight },
      root: pick(root),
      title: pick(title),
      titleHasIcon: Boolean(title?.querySelector('svg')),
      scroll: pick(scroll),
      list: pick(list),
      railCount: root?.querySelectorAll('svg.docs-toc-item-track,.docs-toc-thumb,path.docs-toc-active-path,svg.docs-toc-rail,.docs-toc-active-thumb,svg.absolute,path.stroke-fd-primary').length ?? 0,
      links,
      popover: pick(popover),
      popoverTrigger: pick(popoverTrigger),
    };
  })()`
}

async function capture(options, label, url, viewport) {
  const cdp = await openPage(options, url, viewport)

  try {
    const result = await cdp.send('Runtime.evaluate', {
      expression: createExtractor(options.selector),
      returnByValue: true,
      awaitPromise: true,
    })

    return {
      label,
      url,
      viewport,
      data: result.result.value,
    }
  } finally {
    cdp.close()
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (!options.reference || !options.local) {
    console.error(usage())
    process.exitCode = 1
    return
  }

  await ensureChrome(options)

  const captures = []

  for (const viewportValue of options.viewports) {
    const viewport = parseViewport(viewportValue)
    captures.push(
      await capture(options, `reference-${viewportValue}`, options.reference, viewport),
    )
    captures.push(await capture(options, `local-${viewportValue}`, options.local, viewport))
  }

  const output = JSON.stringify(captures, null, 2)

  if (options.out) {
    await writeFile(options.out, `${output}\n`, 'utf8')
    return
  }

  console.log(output)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
