<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

type DocTypeTableParameter = {
  name: string
  description: string
}

type DocTypeTableRow = {
  id?: string
  name: string
  type: string
  description: string
  required?: boolean
  deprecated?: boolean
  default?: string
  notes?: string
  typeDescription?: string
  typeDescriptionLink?: string
  parameters?: DocTypeTableParameter[]
  returns?: string
}

const props = defineProps<{
  rows: DocTypeTableRow[] | string
}>()

const tableId = `fd-doc-type-table-${useId()}`
const openRowIds = shallowRef<Set<string>>(new Set())
const resolvedRows = computed<DocTypeTableRow[]>(() => {
  if (Array.isArray(props.rows)) {
    return props.rows
  }

  try {
    const parsed = JSON.parse(
      props.rows.replaceAll('&quot;', '"').replaceAll('&apos;', "'"),
    )
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})
const normalizedRows = computed(() => {
  return resolvedRows.value.map((row, index) => {
    const slug = row.name.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase()
    const id = row.id ?? `${tableId}-${slug}-${index}`

    return {
      ...row,
      id,
      triggerId: `${id}-trigger`,
      panelId: `${id}-panel`,
      optional: !row.required,
    }
  })
})

onMounted(() => {
  const hash = window.location.hash.slice(1)

  if (!hash) {
    return
  }

  if (normalizedRows.value.some((row) => row.id === hash)) {
    openRowIds.value = new Set([hash])
  }
})

function isRowOpen(id: string) {
  return openRowIds.value.has(id)
}

function setRowOpen(id: string, open: boolean) {
  const nextOpenRows = new Set(openRowIds.value)

  if (open) {
    nextOpenRows.add(id)

    if (import.meta.client) {
      window.history.replaceState(null, '', `#${id}`)
    }
  } else {
    nextOpenRows.delete(id)
  }

  openRowIds.value = nextOpenRows
}
</script>

<template>
  <div class="fd-doc-type-table" aria-label="Type reference">
    <div class="fd-doc-type-table-head">
      <span>Prop</span>
      <span>Type</span>
      <span aria-hidden="true" />
    </div>

    <div class="fd-doc-type-table-body" role="list">
      <DocCollapsible
        v-for="row in normalizedRows"
        :key="row.id"
        :id="row.id"
        class="fd-doc-type-row"
        role="listitem"
        :open="isRowOpen(row.id)"
        @open-change="setRowOpen(row.id, $event)"
      >
        <template #default="{ open, toggle, contentId }">
          <button
            :id="row.triggerId"
            class="fd-doc-type-trigger"
            type="button"
            :aria-label="`${open ? 'Collapse' : 'Expand'} ${row.name} details`"
            :aria-expanded="open"
            :aria-controls="contentId"
            @click="toggle"
          >
            <span class="fd-doc-type-prop">
              <code :class="{ 'is-deprecated': row.deprecated }">
                {{ row.name }}<span v-if="row.optional">?</span>
              </code>
              <span v-if="row.required" class="fd-doc-type-badge">required</span>
              <span v-if="row.deprecated" class="fd-doc-type-badge is-warning">
                deprecated
              </span>
            </span>
            <span class="fd-doc-type-value">
              <DocsLink
                v-if="row.typeDescriptionLink"
                :href="row.typeDescriptionLink"
              >
                <code>{{ row.type }}</code>
              </DocsLink>
              <code v-else>{{ row.type }}</code>
            </span>
            <ChevronDown class="fd-doc-type-chevron" aria-hidden="true" />
          </button>

          <div
            v-show="open"
            :id="contentId"
            class="fd-doc-type-details"
            role="region"
            :aria-labelledby="row.triggerId"
          >
            <p class="fd-doc-type-description">{{ row.description }}</p>
            <dl class="fd-doc-type-meta">
              <div class="fd-doc-type-meta-row">
                <dt>Type</dt>
                <dd>
                  <code>
                    {{ row.typeDescription ?? row.type
                    }}<template v-if="row.optional"> | undefined</template>
                  </code>
                </dd>
              </div>
              <div v-if="row.default" class="fd-doc-type-meta-row">
                <dt>Default</dt>
                <dd>
                  <code>{{ row.default }}</code>
                </dd>
              </div>
              <div v-if="row.notes" class="fd-doc-type-meta-row">
                <dt>Notes</dt>
                <dd>{{ row.notes }}</dd>
              </div>
              <div v-if="row.parameters?.length" class="fd-doc-type-meta-row">
                <dt>Parameters</dt>
                <dd>
                  <ul class="fd-doc-type-param-list">
                    <li
                      v-for="parameter in row.parameters"
                      :key="parameter.name"
                      class="fd-doc-type-param"
                    >
                      <code>{{ parameter.name }}</code>
                      <span>{{ parameter.description }}</span>
                    </li>
                  </ul>
                </dd>
              </div>
              <div v-if="row.returns" class="fd-doc-type-meta-row">
                <dt>Returns</dt>
                <dd>
                  <code>{{ row.returns }}</code>
                </dd>
              </div>
            </dl>
          </div>
        </template>
      </DocCollapsible>
    </div>
  </div>
</template>
