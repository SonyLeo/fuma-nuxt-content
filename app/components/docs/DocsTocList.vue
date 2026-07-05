<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue'
import type { DocsTocItem, DocsTocItemState } from '~/types/docs'

type TocItemTrack = {
  width: number
  lineX: number
  previousLineX: number
  lineStart: string
  curveD: string | null
  continuesAtSameOffset: boolean
}

type TocRenderItem = DocsTocItem & {
  track: TocItemTrack
}

type TocPosition = {
  id: string
  top: number
  bottom: number
  x: number
  pathStart: number
  pathEnd: number
}

type TocTrack = {
  width: number
  height: number
  d: string
  positions: TocPosition[]
}

type ActiveTrackRange = {
  top: number
  bottom: number
  startIndex: number
  endIndex: number
  startDistance: number
  endDistance: number
}

type ThumbRange = {
  startIndex: number
  endIndex: number
  isUp: boolean
}

const baseOffset = 8

const props = withDefaults(
  defineProps<{
    items?: DocsTocItem[]
    activeId?: string
    itemStates?: readonly DocsTocItemState[]
    progress?: number
  }>(),
  {
    items: () => [],
    activeId: undefined,
    itemStates: () => [],
    progress: 0,
  },
)

const emit = defineEmits<{
  navigate: []
}>()

const listRef = useTemplateRef<HTMLElement>('list')
const track = shallowRef<TocTrack | null>(null)
const thumbDistance = shallowRef(0)
const thumbVisible = shallowRef(false)
const linkElements = new Map<string, HTMLAnchorElement>()
let resizeObserver: ResizeObserver | null = null
let rafId = 0
let previousThumbRange: ThumbRange | null = null
let didInitialAutoScroll = false

const renderItems = computed<TocRenderItem[]>(() => {
  return props.items.map((item, index, list) => {
    const lineX = getLineOffset(item.depth)
    const previousItem = list[index - 1]
    const nextItem = list[index + 1]
    const previousLineX =
      index === 0 || !previousItem
        ? lineX
        : getLineOffset(previousItem.depth)
    const nextLineX =
      index === list.length - 1 || !nextItem
        ? lineX
        : getLineOffset(nextItem.depth)
    const continuesAtSameOffset = lineX === nextLineX

    return {
      ...item,
      track: {
        width: Math.max(previousLineX, lineX) + 9,
        lineX: lineX + 0.5,
        previousLineX: previousLineX + 0.5,
        lineStart: previousLineX === lineX ? '6' : '12',
        curveD:
          previousLineX === lineX
            ? null
            : `M ${previousLineX + 0.5} 0 C ${previousLineX + 0.5} 8 ${
                lineX + 0.5
              } 4 ${lineX + 0.5} 12`,
        continuesAtSameOffset,
      },
    }
  })
})

const stateById = computed(() => {
  const states = new Map<string, DocsTocItemState>()

  for (const state of props.itemStates) {
    states.set(state.id, state)
  }

  return states
})

const activeLinks = computed(() => {
  const links = new Set<string>()

  for (const state of props.itemStates) {
    if (state.active) {
      links.add(state.id)
    }
  }

  if (links.size === 0 && props.activeId) {
    links.add(props.activeId)
  }

  return links
})

const activeTrack = computed<ActiveTrackRange | null>(() => {
  if (!track.value || activeLinks.value.size === 0) {
    return null
  }

  const activePositions = track.value.positions
    .map((position, index) => ({ position, index }))
    .filter(({ position }) => activeLinks.value.has(position.id))

  if (activePositions.length === 0) {
    return null
  }

  const first = activePositions[0]
  const last = activePositions[activePositions.length - 1]

  if (!first || !last) {
    return null
  }

  return {
    top: first.position.top,
    bottom: last.position.bottom,
    startIndex: first.index,
    endIndex: last.index,
    startDistance: first.position.pathStart,
    endDistance: last.position.pathEnd,
  }
})

const thumbTrackStyle = computed(() => {
  if (!track.value || !activeTrack.value) {
    return undefined
  }

  return {
    width: `${track.value.width}px`,
    height: `${track.value.height}px`,
    '--docs-toc-track-top': `${activeTrack.value.top}px`,
    '--docs-toc-track-bottom': `${activeTrack.value.bottom}px`,
  }
})

const thumbStyle = computed(() => {
  if (!track.value || !activeTrack.value) {
    return undefined
  }

  return {
    offsetPath: `path("${track.value.d}")`,
    offsetDistance: `${thumbDistance.value}px`,
    opacity: thumbVisible.value ? '1' : '0',
  }
})

function setItemRef(id: string, element: Element | null) {
  if (element instanceof HTMLAnchorElement) {
    linkElements.set(id, element)
    return
  }

  linkElements.delete(id)
}

function itemStyle(item: DocsTocItem) {
  return {
    paddingInlineStart: `${getItemOffset(item.depth)}px`,
  }
}

function itemTrackStyle(item: TocRenderItem) {
  return {
    width: `${item.track.width}px`,
  }
}

function isItemActive(item: DocsTocItem) {
  return activeLinks.value.has(item.id)
}

function isItemFallback(item: DocsTocItem) {
  return stateById.value.get(item.id)?.fallback ?? false
}

function getItemOffset(depth: number) {
  if (depth <= 2) {
    return 20
  }

  if (depth === 3) {
    return 32
  }

  return 44
}

function getLineOffset(depth: number) {
  if (depth <= 2) {
    return baseOffset
  }

  if (depth === 3) {
    return baseOffset + 8
  }

  return baseOffset + 16
}

function observeList() {
  if (resizeObserver && listRef.value) {
    resizeObserver.observe(listRef.value)
  }
}

function queueMeasure() {
  window.cancelAnimationFrame(rafId)
  rafId = window.requestAnimationFrame(async () => {
    await nextTick()
    observeList()
    measureTrack()
  })
}

function measureTrack() {
  if (!listRef.value || props.items.length === 0) {
    track.value = null
    return
  }

  let width = 0
  let height = 0
  let d = ''
  const measuredPositions: Omit<TocPosition, 'pathStart' | 'pathEnd'>[] = []

  for (const item of props.items) {
    const element = linkElements.get(item.id)

    if (!element) {
      continue
    }

    const styles = window.getComputedStyle(element)
    const x = getLineOffset(item.depth) + 0.5
    const top = element.offsetTop + Number.parseFloat(styles.paddingTop)
    const bottom =
      element.offsetTop +
      element.clientHeight -
      Number.parseFloat(styles.paddingBottom)
    const previous = measuredPositions[measuredPositions.length - 1]

    if (!previous) {
      d += `M ${x} ${top} L ${x} ${bottom}`
    } else {
      d += ` C ${previous.x} ${top - 4} ${x} ${previous.bottom + 4} ${x} ${top} L ${x} ${bottom}`
    }

    width = Math.max(width, x + 8)
    height = Math.max(height, bottom)
    measuredPositions.push({
      id: item.id,
      top,
      bottom,
      x,
    })
  }

  track.value = {
    width,
    height,
    d,
    positions: withPathLengths(d, measuredPositions),
  }

  if (!didInitialAutoScroll) {
    didInitialAutoScroll =
      scrollItemIntoView(props.activeId, true) || didInitialAutoScroll
  }
}

function withPathLengths(
  d: string,
  measuredPositions: Omit<TocPosition, 'pathStart' | 'pathEnd'>[],
) {
  if (d.length === 0 || measuredPositions.length === 0) {
    return []
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', d)

  const totalLength = path.getTotalLength()
  const positions: TocPosition[] = []

  for (let index = 0; index < measuredPositions.length; index++) {
    const position = measuredPositions[index]

    if (!position) {
      continue
    }

    const previousMeasured = measuredPositions[index - 1]
    const previousPosition = positions[index - 1]
    let pathStart =
      previousPosition && previousMeasured
        ? previousPosition.pathEnd + (position.top - previousMeasured.bottom)
        : position.top

    while (
      pathStart < totalLength &&
      path.getPointAtLength(pathStart).y < position.top
    ) {
      pathStart += 1
    }

    positions.push({
      id: position.id,
      top: position.top,
      bottom: position.bottom,
      x: position.x,
      pathStart,
      pathEnd: pathStart + position.bottom - position.top,
    })
  }

  return positions
}

function getScrollContainer(element: HTMLElement) {
  let current = element.parentElement

  while (current && current !== document.body) {
    const styles = window.getComputedStyle(current)
    const overflowY = styles.overflowY

    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      current.scrollHeight > current.clientHeight
    ) {
      return current
    }

    current = current.parentElement
  }

  return listRef.value?.parentElement ?? null
}

function scrollItemIntoView(id: string | undefined, instant = false) {
  if (!id) {
    return false
  }

  const element = linkElements.get(id)

  if (!element) {
    return false
  }

  const container = getScrollContainer(element)

  if (!container || container.clientHeight === 0) {
    return false
  }

  const elementRect = element.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const distanceToCenter =
    elementRect.top -
    containerRect.top -
    container.clientHeight / 2 +
    elementRect.height / 2

  if (Math.abs(distanceToCenter) < elementRect.height) {
    return true
  }

  container.scrollTo({
    top: container.scrollTop + distanceToCenter,
    behavior: instant ? 'auto' : 'smooth',
  })

  return true
}

function onItemClick() {
  emit('navigate')
}

onMounted(() => {
  resizeObserver = new ResizeObserver(queueMeasure)
  observeList()
  queueMeasure()
})

watch(activeTrack, (range) => {
  if (!range) {
    thumbDistance.value = 0
    thumbVisible.value = false
    previousThumbRange = null
    return
  }

  let isUp = false

  if (previousThumbRange) {
    isUp =
      previousThumbRange.startIndex > range.startIndex ||
      previousThumbRange.endIndex > range.endIndex ||
      (previousThumbRange.startIndex === range.startIndex &&
        previousThumbRange.endIndex === range.endIndex &&
        previousThumbRange.isUp)
  }

  previousThumbRange = {
    startIndex: range.startIndex,
    endIndex: range.endIndex,
    isUp,
  }
  thumbDistance.value = isUp ? range.startDistance : range.endDistance
  thumbVisible.value = true
})

watch(
  () => props.items,
  () => {
    linkElements.clear()
    track.value = null
    previousThumbRange = null
    didInitialAutoScroll = false
    queueMeasure()
  },
)

watch(
  () => props.activeId,
  async (id) => {
    await nextTick()
    didInitialAutoScroll =
      scrollItemIntoView(id, !didInitialAutoScroll) || didInitialAutoScroll
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  window.cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
})
</script>

<template>
  <nav
    v-if="items.length > 0"
    class="docs-toc-list-shell"
    aria-label="Table of contents"
  >
    <div ref="list" class="docs-toc-list">
      <div
        v-if="track && activeTrack"
        class="docs-toc-thumb-track"
        :style="thumbTrackStyle"
        aria-hidden="true"
      >
        <svg
          class="docs-toc-active-track"
          :width="track.width"
          :height="track.height"
          :viewBox="`0 0 ${track.width} ${track.height}`"
        >
          <path class="docs-toc-active-path" :d="track.d" />
        </svg>

        <span class="docs-toc-thumb" :style="thumbStyle" />
      </div>

      <a
        v-for="item in renderItems"
        :key="item.id"
        :ref="(element) => setItemRef(item.id, element as Element | null)"
        class="docs-toc-link"
        :class="{ 'is-active': isItemActive(item) }"
        :data-active="isItemActive(item) ? 'true' : undefined"
        :data-fallback="isItemFallback(item) ? 'true' : undefined"
        :href="`#${item.id}`"
        :style="itemStyle(item)"
        :aria-current="activeId === item.id ? 'location' : undefined"
        @click="onItemClick"
      >
        <svg
          class="docs-toc-item-track"
          :class="{
            'docs-toc-item-track--continues': item.track.continuesAtSameOffset,
          }"
          :style="itemTrackStyle(item)"
          aria-hidden="true"
        >
          <path
            v-if="item.track.curveD"
            class="docs-toc-item-track-path"
            :d="item.track.curveD"
          />
          <line
            class="docs-toc-item-track-path"
            :x1="item.track.lineX"
            :y1="item.track.lineStart"
            :x2="item.track.lineX"
            y2="100%"
          />
        </svg>
        <span class="docs-toc-link-text">{{ item.text }}</span>
      </a>
    </div>
  </nav>
</template>
