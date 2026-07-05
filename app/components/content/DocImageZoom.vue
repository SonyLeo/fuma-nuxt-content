<script setup lang="ts">
import { Maximize2, X } from '@lucide/vue'
import { computed, nextTick, shallowRef, useId, useTemplateRef, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    src?: string
    alt?: string
    width?: string | number
    height?: string | number
    loading?: 'eager' | 'lazy'
    zoomSrc?: string
    zoomAlt?: string
    zoom?: boolean
  }>(),
  {
    src: undefined,
    alt: undefined,
    width: undefined,
    height: undefined,
    loading: 'lazy',
    zoomSrc: undefined,
    zoomAlt: undefined,
    zoom: true,
  },
)

const open = shallowRef(false)
const triggerRef = useTemplateRef<HTMLButtonElement>('trigger')
const fallbackId = useId()
const isZoomable = computed(() => props.zoom && Boolean(props.src))
const resolvedAlt = computed(() => props.alt ?? '')
const resolvedZoomSrc = computed(() => props.zoomSrc ?? props.src)
const resolvedZoomAlt = computed(() => props.zoomAlt ?? resolvedAlt.value)
const triggerLabel = computed(() =>
  resolvedAlt.value ? `Zoom image: ${resolvedAlt.value}` : 'Zoom image',
)
const dialogLabel = computed(() =>
  resolvedAlt.value ? `Zoomed image: ${resolvedAlt.value}` : 'Zoomed image',
)
const contentId = computed(() => `fd-doc-image-zoom-${fallbackId}`)

function openZoom() {
  if (isZoomable.value) {
    open.value = true
  }
}

watch(open, async (isOpen, wasOpen) => {
  if (isOpen || !wasOpen) {
    return
  }

  await nextTick()
  triggerRef.value?.focus()
})
</script>

<template>
  <figure
    class="fd-doc-image"
    :data-zoomable="isZoomable ? 'true' : 'false'"
  >
    <button
      v-if="isZoomable"
      ref="trigger"
      type="button"
      class="fd-doc-image-trigger"
      :aria-label="triggerLabel"
      :aria-expanded="open"
      :aria-controls="contentId"
      @click="openZoom"
    >
      <img
        :src="src"
        :alt="resolvedAlt"
        :width="width"
        :height="height"
        :loading="loading"
        decoding="async"
      />
      <span class="fd-doc-image-zoom-hint" aria-hidden="true">
        <Maximize2 :size="16" />
      </span>
    </button>

    <img
      v-else
      :src="src"
      :alt="resolvedAlt"
      :width="width"
      :height="height"
      :loading="loading"
      decoding="async"
    />

    <figcaption v-if="$slots.caption || alt">
      <slot name="caption">{{ alt }}</slot>
    </figcaption>
  </figure>

  <UiDialog
    v-if="isZoomable"
    v-model:open="open"
    :content-id="contentId"
  >
    <UiDialogOverlay class="fd-doc-image-zoom-overlay">
      <UiDialogContent
        class="fd-doc-image-zoom-content"
        :aria-label="dialogLabel"
      >
        <UiDialogClose
          class="fd-doc-image-zoom-close ui-button"
          aria-label="Close zoomed image"
        >
          <X :size="18" aria-hidden="true" />
        </UiDialogClose>

        <img
          class="fd-doc-image-zoom-img"
          :src="resolvedZoomSrc"
          :alt="resolvedZoomAlt"
          decoding="async"
        />

        <p v-if="alt" class="fd-doc-image-zoom-caption">
          {{ alt }}
        </p>
      </UiDialogContent>
    </UiDialogOverlay>
  </UiDialog>
</template>
