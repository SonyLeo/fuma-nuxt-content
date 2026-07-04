declare global {
  interface Window {
    __docsHydrated?: boolean
    __docsReadyAt?: number
  }
}

const readyAttribute = 'data-docs-hydrated'

let readyVersion = 0

function markPending() {
  readyVersion += 1
  document.documentElement.setAttribute(readyAttribute, 'false')
  window.__docsHydrated = false

  return readyVersion
}

function markReady(version: number) {
  if (version !== readyVersion) {
    return
  }

  document.documentElement.setAttribute(readyAttribute, 'true')
  window.__docsHydrated = true
  window.__docsReadyAt = Date.now()
}

function markReadyAfterRender(version = readyVersion) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => markReady(version))
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  let hydrated = nuxtApp.isHydrating !== true

  const initialVersion = markPending()

  if (hydrated) {
    markReadyAfterRender(initialVersion)
  }

  nuxtApp.hook('app:suspense:resolve', () => {
    hydrated = true
    markReadyAfterRender()
  })

  nuxtApp.hook('page:start', () => {
    if (hydrated) {
      markPending()
    }
  })

  nuxtApp.hook('page:finish', () => {
    if (hydrated) {
      markReadyAfterRender()
    }
  })
})
