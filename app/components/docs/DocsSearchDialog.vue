<script setup lang="ts">
import { Search, X } from '@lucide/vue'
import type { DocsSearchResult, DocsSearchStatus } from '~/types/docs-search'

const props = withDefaults(
  defineProps<{
    open?: boolean
    query?: string
    results?: DocsSearchResult[]
    status?: DocsSearchStatus
    label?: string
    placeholder?: string
    emptyLabel?: string
  }>(),
  {
    open: false,
    query: '',
    results: () => [],
    status: 'idle',
    label: 'Search',
    placeholder: 'Search documentation...',
    emptyLabel: 'No results found.',
  },
)

const emit = defineEmits<{
  close: []
  'update:query': [value: string]
}>()

const searchInput = useTemplateRef<{ focus: () => void }>('searchInput')
const activeIndex = shallowRef(0)
const searchListboxId = `docs-search-listbox-${useId()}`

function getResultOptionId(index: number) {
  return `${searchListboxId}-option-${index}`
}

const statusLabel = computed(() => {
  if (props.status === 'idle') {
    return 'Type to search documentation.'
  }

  if (props.status === 'empty') {
    return props.emptyLabel
  }

  return `${props.results.length} result${
    props.results.length === 1 ? '' : 's'
  }`
})
const activeResult = computed(() => {
  if (props.status !== 'results') {
    return null
  }

  return props.results[activeIndex.value] ?? null
})
const activeResultId = computed(() => {
  if (!activeResult.value) {
    return undefined
  }

  return getResultOptionId(activeIndex.value)
})

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      return
    }

    await nextTick()
    searchInput.value?.focus()
  },
)

watch(
  () => [props.status, props.results.length, props.query],
  () => {
    activeIndex.value = 0
  },
)

function handleOpenChange(isOpen: boolean) {
  if (!isOpen) {
    emit('close')
  }
}

function updateQuery(value: string) {
  emit('update:query', value)
}

async function selectResult(result: DocsSearchResult | null) {
  if (!result) {
    return
  }

  emit('close')
  await navigateTo(result.path)
}

function onDialogKeydown(event: KeyboardEvent) {
  if (
    props.status !== 'results' ||
    props.results.length === 0 ||
    event.isComposing
  ) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % props.results.length
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value =
      (activeIndex.value - 1 + props.results.length) % props.results.length
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    void selectResult(activeResult.value)
  }
}
</script>

<template>
  <UiCommandDialog :open="open" @update:open="handleOpenChange">
    <UiDialogOverlay class="docs-search-overlay" role="presentation">
      <UiDialogContent
        class="docs-search-dialog"
        :aria-label="label"
        @keydown="onDialogKeydown"
      >
        <UiDialogHeader class="docs-search-dialog-bar">
          <Search class="docs-search-dialog-icon" aria-hidden="true" />
          <UiCommandInput
            ref="searchInput"
            class="docs-search-input"
            type="search"
            role="combobox"
            :model-value="query"
            :placeholder="placeholder"
            :aria-label="label"
            aria-autocomplete="list"
            :aria-controls="searchListboxId"
            :aria-expanded="open"
            :aria-activedescendant="activeResultId"
            @update:model-value="updateQuery"
          />
          <UiDialogClose class="docs-search-close" aria-label="Close search">
            <X class="docs-search-close-icon" aria-hidden="true" />
          </UiDialogClose>
        </UiDialogHeader>

        <UiScrollArea class="docs-search-results">
          <UiScrollViewport>
            <UiCommandList
              :id="searchListboxId"
              class="docs-search-results-inner"
              role="listbox"
              aria-live="polite"
            >
              <p v-if="status !== 'results'" class="docs-search-state">
                {{ statusLabel }}
              </p>

              <ul v-else class="docs-search-result-list">
                <li
                  v-for="(result, index) in results"
                  :key="result.id"
                  class="docs-search-result-item"
                >
                  <UiCommandItem
                    :id="getResultOptionId(index)"
                    class="docs-search-result-link"
                    role="option"
                    :active="activeIndex === index"
                    @pointermove="activeIndex = index"
                  >
                    <DocsLink
                      class="docs-search-result-link-inner"
                      :href="result.path"
                      @click="emit('close')"
                    >
                      <span class="docs-search-result-title">
                        {{ result.title }}
                      </span>
                      <span
                        v-if="result.description || result.excerpt"
                        class="docs-search-result-description"
                      >
                        {{ result.description || result.excerpt }}
                      </span>
                    </DocsLink>
                  </UiCommandItem>
                </li>
              </ul>
            </UiCommandList>
          </UiScrollViewport>
          <UiScrollBar>
            <UiScrollThumb />
          </UiScrollBar>
        </UiScrollArea>
      </UiDialogContent>
    </UiDialogOverlay>
  </UiCommandDialog>
</template>
