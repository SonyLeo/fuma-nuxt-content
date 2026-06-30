export function addCheck(report, check) {
  report.checks.push(check)
}

export function cssPx(value) {
  if (typeof value !== 'string') {
    return Number.NaN
  }

  return Number.parseFloat(value.replace('px', ''))
}

export function cssPxNear(value, expected, tolerance = 0.5) {
  const actual = cssPx(value)

  return Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance
}

export function rectNear(actual, expected, tolerance = 1) {
  return (
    Number.isFinite(actual) &&
    Number.isFinite(expected) &&
    Math.abs(actual - expected) <= tolerance
  )
}
