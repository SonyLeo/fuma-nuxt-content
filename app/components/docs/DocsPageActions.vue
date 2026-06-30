<script setup lang="ts">
import {
  Bot,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  FileCode2,
  Pencil,
} from '@lucide/vue'
import type { DocsPageAction } from '~/types/docs-actions'

const props = withDefaults(
  defineProps<{
    actions?: DocsPageAction[]
  }>(),
  {
    actions: () => [],
  },
)

const emit = defineEmits<{
  run: [action: DocsPageAction]
}>()

const visibleActions = computed(() => {
  return props.actions.filter((action) => !action.hidden)
})
const copyAction = computed(() => {
  return visibleActions.value.find((action) => {
    return action.id === 'copy-markdown' || action.icon === 'copy'
  })
})
const openActions = computed(() => {
  return visibleActions.value.filter(
    (action) => action.id !== copyAction.value?.id,
  )
})

function actionLabel(action: DocsPageAction) {
  if (action.state === 'success') {
    return `${action.label} done`
  }

  if (action.state === 'failed') {
    return `${action.label} failed`
  }

  return action.ariaLabel ?? action.label
}

function runAction(action: DocsPageAction) {
  if (action.disabled || action.state === 'loading') {
    return
  }

  emit('run', action)
}

function runPopoverAction(action: DocsPageAction, close: () => void) {
  runAction(action)
  close()
}
</script>

<template>
  <DocsActionGroup v-if="visibleActions.length > 0" class="docs-page-action-list">
    <UiButton
      v-if="copyAction"
      variant="secondary"
      size="sm"
      class="docs-page-action"
      :disabled="copyAction.disabled || copyAction.state === 'loading'"
      :loading="copyAction.state === 'loading'"
      :aria-label="actionLabel(copyAction)"
      :data-action-id="copyAction.id"
      :data-state="copyAction.state ?? 'idle'"
      @click="runAction(copyAction)"
    >
      <Check
        v-if="copyAction.state === 'success'"
        :size="14"
        aria-hidden="true"
      />
      <Copy v-else :size="14" aria-hidden="true" />
      <span>{{ copyAction.label }}</span>
    </UiButton>

    <UiPopover
      v-if="openActions.length > 0"
      content-id="docs-page-open-options"
      align="start"
      :side-offset="8"
    >
      <template #default="{ close }">
        <UiPopoverTrigger class="docs-page-action docs-page-open-trigger">
          <span>Open</span>
          <ChevronDown :size="14" aria-hidden="true" />
        </UiPopoverTrigger>

        <UiPopoverContent class="docs-page-open-popover">
          <div class="docs-page-open-options">
            <template v-for="action in openActions" :key="action.id">
              <DocsLink
                v-if="action.type === 'link' && action.href && !action.disabled"
                :href="action.href"
                :external="action.external"
                class="docs-page-open-option"
                :aria-label="actionLabel(action)"
                :data-action-id="action.id"
                :data-state="action.state ?? 'idle'"
                @click="close"
              >
                <DocsNavIcon v-if="action.icon === 'github'" name="github" />
                <FileCode2
                  v-else-if="action.icon === 'source'"
                  :size="15"
                  aria-hidden="true"
                />
                <Pencil
                  v-else-if="action.icon === 'edit'"
                  :size="15"
                  aria-hidden="true"
                />
                <ExternalLink
                  v-else-if="action.icon === 'external'"
                  :size="15"
                  aria-hidden="true"
                />
                <Bot v-else :size="15" aria-hidden="true" />
                <span>{{ action.label }}</span>
                <ExternalLink
                  v-if="action.external"
                  class="docs-page-open-option-external"
                  :size="13"
                  aria-hidden="true"
                />
              </DocsLink>

              <button
                v-else
                type="button"
                class="docs-page-open-option"
                :disabled="action.disabled || action.state === 'loading'"
                :aria-label="actionLabel(action)"
                :data-action-id="action.id"
                :data-state="action.state ?? 'idle'"
                @click="runPopoverAction(action, close)"
              >
                <Copy v-if="action.icon === 'copy'" :size="15" aria-hidden="true" />
                <FileCode2
                  v-else-if="action.icon === 'source'"
                  :size="15"
                  aria-hidden="true"
                />
                <span>
                  <template v-if="action.state === 'success'">Copied</template>
                  <template v-else-if="action.state === 'failed'">Failed</template>
                  <template v-else>{{ action.label }}</template>
                </span>
              </button>
            </template>
          </div>
        </UiPopoverContent>
      </template>
    </UiPopover>

    <template v-else-if="!copyAction">
      <template v-for="action in visibleActions" :key="action.id">
        <DocsLink
          v-if="action.type === 'link' && action.href && !action.disabled"
          :href="action.href"
          :external="action.external"
          class="docs-page-action"
          :aria-label="actionLabel(action)"
          :data-action-id="action.id"
          :data-state="action.state ?? 'idle'"
        >
          <DocsNavIcon v-if="action.icon === 'github'" name="github" />
          <FileCode2
            v-else-if="action.icon === 'source'"
            :size="15"
            aria-hidden="true"
          />
          <Pencil
            v-else-if="action.icon === 'edit'"
            :size="15"
            aria-hidden="true"
          />
          <ExternalLink
            v-else-if="action.icon === 'external'"
            :size="15"
            aria-hidden="true"
          />
          <span>{{ action.label }}</span>
        </DocsLink>

        <UiButton
          v-else
          variant="secondary"
          size="sm"
          class="docs-page-action"
          :disabled="action.disabled || action.state === 'loading'"
          :loading="action.state === 'loading'"
          :aria-label="actionLabel(action)"
          :data-action-id="action.id"
          :data-state="action.state ?? 'idle'"
          @click="runAction(action)"
        >
          <Copy v-if="action.icon === 'copy'" :size="15" aria-hidden="true" />
          <FileCode2
            v-else-if="action.icon === 'source'"
            :size="15"
            aria-hidden="true"
          />
          <span>
            <template v-if="action.state === 'success'">Copied</template>
            <template v-else-if="action.state === 'failed'">Failed</template>
            <template v-else>{{ action.label }}</template>
          </span>
        </UiButton>
      </template>
    </template>
  </DocsActionGroup>
</template>
