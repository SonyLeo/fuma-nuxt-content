export interface DocsSidebarScrollGeometry {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
  viewportTop: number
  viewportBottom: number
  itemTop: number
  itemBottom: number
  inset?: number
}

export function resolveDocsSidebarScrollTop({
  scrollTop,
  scrollHeight,
  clientHeight,
  viewportTop,
  viewportBottom,
  itemTop,
  itemBottom,
  inset = 12,
}: DocsSidebarScrollGeometry) {
  const safeTop = viewportTop + inset
  const safeBottom = viewportBottom - inset
  let nextScrollTop = scrollTop

  if (itemTop < safeTop) {
    nextScrollTop += itemTop - safeTop
  } else if (itemBottom > safeBottom) {
    nextScrollTop += itemBottom - safeBottom
  }

  return Math.min(
    Math.max(nextScrollTop, 0),
    Math.max(scrollHeight - clientHeight, 0),
  )
}
