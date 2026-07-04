<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue'
import type { Component } from 'vue'
import type { DocsThemeMode, DocsThemeSwitchMode } from '~/types/docs-theme'

const props = withDefaults(
  defineProps<{
    mode?: DocsThemeSwitchMode
  }>(),
  {
    mode: undefined,
  },
)

const theme = useDocsTheme()
const switchMode = computed(() => props.mode ?? theme.config.value.switchMode)
const activeResolvedMode = computed(() => {
  return theme.mounted.value ? theme.resolvedMode.value : null
})
const activeMode = computed(() => {
  return theme.mounted.value ? theme.mode.value : null
})

const themeOptions: Array<{
  label: string
  mode: DocsThemeMode
  icon: Component
}> = [
  {
    label: 'Use light theme',
    mode: 'light',
    icon: Sun,
  },
  {
    label: 'Use dark theme',
    mode: 'dark',
    icon: Moon,
  },
  {
    label: 'Use system theme',
    mode: 'system',
    icon: Monitor,
  },
]

const toggleLabel = computed(() => {
  return theme.isDark.value ? 'Switch to light theme' : 'Switch to dark theme'
})
</script>

<template>
  <button
    v-if="theme.config.value.enabled && switchMode === 'light-dark'"
    type="button"
    class="docs-theme-toggle"
    data-theme-toggle
    :data-active-mode="activeResolvedMode"
    :aria-label="toggleLabel"
    :aria-pressed="theme.isDark.value"
    @click="theme.toggleMode"
  >
    <span
      class="docs-theme-toggle-option"
      :data-active="activeResolvedMode === 'light' ? 'true' : 'false'"
      aria-hidden="true"
    >
      <Sun class="docs-theme-icon" />
    </span>
    <span
      class="docs-theme-toggle-option"
      :data-active="activeResolvedMode === 'dark' ? 'true' : 'false'"
      aria-hidden="true"
    >
      <Moon class="docs-theme-icon" />
    </span>
  </button>

  <div
    v-else-if="theme.config.value.enabled"
    class="docs-theme-switch"
    data-theme-toggle
    role="group"
    aria-label="Theme"
  >
    <button
      v-for="option in themeOptions"
      :key="option.mode"
      type="button"
      class="docs-theme-button"
      :data-theme-mode="option.mode"
      :data-active="activeMode === option.mode ? 'true' : 'false'"
      :aria-label="option.label"
      :aria-pressed="activeMode === option.mode"
      @click="theme.setMode(option.mode)"
    >
      <component :is="option.icon" class="docs-theme-icon" aria-hidden="true" />
    </button>
  </div>
</template>
