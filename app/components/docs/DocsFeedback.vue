<script setup lang="ts">
import { ThumbsDown, ThumbsUp } from '@lucide/vue'
import type { DocsSiteFeedbackConfig } from '~/types/docs-site'

type FeedbackValue = 'positive' | 'negative'

const props = defineProps<{
  config?: DocsSiteFeedbackConfig
  path?: string
  sourcePath?: string | null
}>()

const selected = shallowRef<FeedbackValue | null>(null)
const enabled = computed(() => props.config?.enabled === true)
const promptLabel = computed(
  () => props.config?.promptLabel ?? 'How is this guide?',
)
const positiveLabel = computed(() => props.config?.positiveLabel ?? 'Helpful')
const negativeLabel = computed(
  () => props.config?.negativeLabel ?? 'Not helpful',
)
const thanksLabel = computed(
  () => props.config?.thanksLabel ?? 'Thanks for the feedback.',
)

function selectFeedback(value: FeedbackValue) {
  selected.value = value
}
</script>

<template>
  <section
    v-if="enabled"
    class="docs-feedback"
    :data-page-path="path"
    :data-source-path="sourcePath || undefined"
    aria-label="Page feedback"
  >
    <p class="docs-feedback-prompt">{{ promptLabel }}</p>
    <div class="docs-feedback-actions">
      <UiButton
        variant="outline"
        size="sm"
        class="docs-feedback-button"
        :pressed="selected === 'positive'"
        @click="selectFeedback('positive')"
      >
        <ThumbsUp class="docs-feedback-icon" aria-hidden="true" />
        <span>{{ positiveLabel }}</span>
      </UiButton>
      <UiButton
        variant="outline"
        size="sm"
        class="docs-feedback-button"
        :pressed="selected === 'negative'"
        @click="selectFeedback('negative')"
      >
        <ThumbsDown class="docs-feedback-icon" aria-hidden="true" />
        <span>{{ negativeLabel }}</span>
      </UiButton>
    </div>
    <p v-if="selected" class="docs-feedback-thanks" aria-live="polite">
      {{ thanksLabel }}
    </p>
  </section>
</template>
