import { readFile } from 'node:fs/promises'

function parseArgs(argv) {
  const out = {
    profile: 'toc',
    format: 'text',
    tolerance: 0.5,
  }

  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      continue
    }

    const [key, value = ''] = arg.slice(2).split('=')
    out[key] = value
  }

  out.tolerance = Number(out.tolerance || 0.5)

  return out
}

function usage() {
  return [
    'Usage:',
    '  node scripts/parity-compare.mjs --profile=toc --input=tmp/toc-parity.json',
    '',
    'Options:',
    '  --profile=toc',
    '  --format=text|json',
    '  --tolerance=0.5',
  ].join('\n')
}

function getPath(value, path) {
  return path.split('.').reduce((current, key) => current?.[key], value)
}

function rectToString(rect) {
  if (!rect) {
    return 'missing'
  }

  return `${rect.x},${rect.y},${rect.width}x${rect.height}`
}

function numbersClose(left, right, tolerance) {
  return Math.abs(Number(left) - Number(right)) <= tolerance
}

function rectClose(left, right, tolerance) {
  if (!left || !right) {
    return false
  }

  return (
    numbersClose(left.x, right.x, tolerance) &&
    numbersClose(left.y, right.y, tolerance) &&
    numbersClose(left.width, right.width, tolerance) &&
    numbersClose(left.height, right.height, tolerance)
  )
}

function addCheck(report, check) {
  report.checks.push(check)
}

function expectEqual(report, label, reference, local, path) {
  const referenceValue = getPath(reference, path)
  const localValue = getPath(local, path)
  const pass = Object.is(referenceValue, localValue)

  addCheck(report, {
    type: 'required',
    label,
    path,
    pass,
    reference: referenceValue,
    local: localValue,
  })
}

function expectRect(report, label, reference, local, path, tolerance) {
  const referenceValue = getPath(reference, path)
  const localValue = getPath(local, path)
  const pass = rectClose(referenceValue, localValue, tolerance)

  addCheck(report, {
    type: 'required',
    label,
    path,
    pass,
    reference: rectToString(referenceValue),
    local: rectToString(localValue),
    tolerance,
  })
}

function addObservation(report, label, reference, local, path, reason) {
  const referenceValue = getPath(reference, path)
  const localValue = getPath(local, path)

  addCheck(report, {
    type: 'observation',
    label,
    path,
    pass: Object.is(referenceValue, localValue),
    reference: referenceValue,
    local: localValue,
    reason,
  })
}

function addLinkRhythmChecks(report, reference, local) {
  const referenceLinks = reference.links ?? []
  const localLinks = local.links ?? []
  const sharedCount = Math.min(referenceLinks.length, localLinks.length)
  const fields = [
    'style.display',
    'style.paddingTop',
    'style.fontSize',
    'style.fontWeight',
    'style.lineHeight',
  ]

  for (let index = 0; index < sharedCount; index++) {
    for (const field of fields) {
      expectEqual(
        report,
        `link ${index + 1} ${field}`,
        referenceLinks[index],
        localLinks[index],
        field,
      )
    }

    const referenceIsLast = index === referenceLinks.length - 1
    const localIsLast = index === localLinks.length - 1

    if (referenceIsLast === localIsLast) {
      expectEqual(
        report,
        `link ${index + 1} style.paddingBottom`,
        referenceLinks[index],
        localLinks[index],
        'style.paddingBottom',
      )
    } else {
      addCheck(report, {
        type: 'observation',
        label: `link ${index + 1} style.paddingBottom`,
        path: 'style.paddingBottom',
        pass: false,
        reference: getPath(referenceLinks[index], 'style.paddingBottom'),
        local: getPath(localLinks[index], 'style.paddingBottom'),
        reason:
          'Last-row padding differs because the reference and local heading fixtures have different link counts.',
      })
    }
  }

  addCheck(report, {
    type: 'observation',
    label: 'link count',
    path: 'links.length',
    pass: referenceLinks.length === localLinks.length,
    reference: referenceLinks.length,
    local: localLinks.length,
    reason:
      'Different heading fixtures are allowed during component-structure parity.',
  })
}

function pairCaptures(captures) {
  const pairs = new Map()

  for (const capture of captures) {
    const match = /^(?<side>reference|local)-(?<viewport>\d+x\d+)$/.exec(
      capture.label,
    )

    if (!match?.groups) {
      continue
    }

    const pair = pairs.get(match.groups.viewport) ?? {}
    pair[match.groups.side] = capture.data
    pairs.set(match.groups.viewport, pair)
  }

  return pairs
}

function compareToc(captures, options) {
  const report = {
    profile: 'toc',
    status: 'pass',
    tolerance: options.tolerance,
    checks: [],
  }
  const pairs = pairCaptures(captures)
  const desktop = pairs.get('1440x1000')
  const tablet = pairs.get('994x1000')

  if (!desktop?.reference || !desktop?.local) {
    addCheck(report, {
      type: 'required',
      label: 'desktop capture pair',
      pass: false,
      reason: 'Missing reference/local capture for 1440x1000.',
    })
  } else {
    expectRect(
      report,
      'desktop root rect',
      desktop.reference,
      desktop.local,
      'root.rect',
      options.tolerance,
    )
    expectEqual(report, 'desktop root display', desktop.reference, desktop.local, 'root.style.display')
    expectEqual(report, 'desktop root position', desktop.reference, desktop.local, 'root.style.position')
    expectEqual(report, 'desktop root grid area', desktop.reference, desktop.local, 'root.style.gridArea')
    expectEqual(report, 'desktop root padding', desktop.reference, desktop.local, 'root.style.padding')
    expectEqual(report, 'desktop title tag', desktop.reference, desktop.local, 'title.tag')
    expectEqual(report, 'desktop title icon', desktop.reference, desktop.local, 'titleHasIcon')
    expectEqual(report, 'desktop title font size', desktop.reference, desktop.local, 'title.style.fontSize')
    expectEqual(report, 'desktop title line height', desktop.reference, desktop.local, 'title.style.lineHeight')
    expectEqual(report, 'desktop title font weight', desktop.reference, desktop.local, 'title.style.fontWeight')
    addLinkRhythmChecks(report, desktop.reference, desktop.local)
    addObservation(
      report,
      'desktop active link color',
      desktop.reference.links?.[0],
      desktop.local.links?.[0],
      'style.color',
      'Token/theme parity is tracked separately from structural TOC parity.',
    )
    addObservation(
      report,
      'desktop rail complexity',
      desktop.reference,
      desktop.local,
      'railCount',
      'Rail node count depends on heading fixture size and implementation details; validate geometry and visible behavior separately.',
    )
  }

  if (!tablet?.reference || !tablet?.local) {
    addCheck(report, {
      type: 'required',
      label: 'responsive capture pair',
      pass: false,
      reason: 'Missing reference/local capture for 994x1000.',
    })
  } else {
    expectEqual(report, 'responsive desktop toc hidden', tablet.reference, tablet.local, 'root.style.display')
    expectEqual(report, 'responsive popover display', tablet.reference, tablet.local, 'popover.style.display')
    expectRect(
      report,
      'responsive popover rect',
      tablet.reference,
      tablet.local,
      'popover.rect',
      options.tolerance,
    )
    expectRect(
      report,
      'responsive trigger rect',
      tablet.reference,
      tablet.local,
      'popoverTrigger.rect',
      options.tolerance,
    )
    expectEqual(
      report,
      'responsive trigger padding',
      tablet.reference,
      tablet.local,
      'popoverTrigger.style.padding',
    )
    expectEqual(
      report,
      'responsive trigger font size',
      tablet.reference,
      tablet.local,
      'popoverTrigger.style.fontSize',
    )
    expectEqual(
      report,
      'responsive trigger line height',
      tablet.reference,
      tablet.local,
      'popoverTrigger.style.lineHeight',
    )
  }

  if (report.checks.some((check) => check.type === 'required' && !check.pass)) {
    report.status = 'fail'
  }

  return report
}

function formatReport(report) {
  const required = report.checks.filter((check) => check.type === 'required')
  const observations = report.checks.filter(
    (check) => check.type === 'observation',
  )
  const failed = required.filter((check) => !check.pass)
  const passed = required.length - failed.length

  const lines = [
    `Parity profile: ${report.profile}`,
    `Status: ${report.status.toUpperCase()}`,
    `Required checks: ${passed}/${required.length} passed`,
  ]

  if (failed.length > 0) {
    lines.push('', 'Failed required checks:')

    for (const check of failed) {
      lines.push(
        `- ${check.label}: reference=${check.reference ?? 'missing'}, local=${check.local ?? 'missing'}`,
      )
    }
  }

  const noteworthy = observations.filter((check) => !check.pass)

  if (noteworthy.length > 0) {
    lines.push('', 'Tracked non-blocking differences:')

    for (const check of noteworthy) {
      lines.push(
        `- ${check.label}: reference=${check.reference ?? 'missing'}, local=${check.local ?? 'missing'}`,
      )

      if (check.reason) {
        lines.push(`  Reason: ${check.reason}`)
      }
    }
  }

  return lines.join('\n')
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (!options.input) {
    console.error(usage())
    process.exitCode = 1
    return
  }

  if (options.profile !== 'toc') {
    console.error(`Unsupported parity profile: ${options.profile}`)
    process.exitCode = 1
    return
  }

  const captures = JSON.parse(await readFile(options.input, 'utf8'))
  const report = compareToc(captures, options)

  if (options.format === 'json') {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log(formatReport(report))
  }

  if (report.status !== 'pass') {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
