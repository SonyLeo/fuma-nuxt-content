<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

type DocTypeTableParameter = {
  name: string
  description: string
}

type DocTypeTableRow = {
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
  rows: DocTypeTableRow[]
}>()

const tableId = `fd-doc-type-table-${useId()}`
const openRows = shallowRef<Set<string>>(new Set())
const normalizedRows = computed(() => {
  return props.rows.map((row, index) => {
    const slug = row.name.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase()
    const id = `${tableId}-${slug}-${index}`

    return {
      ...row,
      id,
      triggerId: `${id}-trigger`,
      panelId: `${id}-panel`,
      optional: !row.required,
    }
  })
})

function isOpen(id: string) {
  return openRows.value.has(id)
}

function toggleRow(id: string) {
  const next = new Set(openRows.value)

  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }

  openRows.value = next
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
      <div
        v-for="row in normalizedRows"
        :key="row.id"
        class="fd-doc-type-row"
        :class="{ 'is-open': isOpen(row.id) }"
        role="listitem"
      >
        <button
          :id="row.triggerId"
          class="fd-doc-type-trigger"
          type="button"
          :aria-label="`${isOpen(row.id) ? 'Collapse' : 'Expand'} ${row.name} details`"
          :aria-expanded="isOpen(row.id)"
          :aria-controls="row.panelId"
          @click="toggleRow(row.id)"
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
          v-show="isOpen(row.id)"
          :id="row.panelId"
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
            <div class="fd-doc-type-meta-row">
              <dt>Required</dt>
              <dd>{{ row.required ? 'Yes' : 'No' }}</dd>
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
      </div>
    </div>
  </div>
</template>
