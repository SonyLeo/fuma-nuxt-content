export type CopyState = 'idle' | 'loading' | 'copied' | 'failed'

type UseCopyStateOptions = {
  resetMs?: number
}

export function useCopyState(options: UseCopyStateOptions = {}) {
  const resetMs = options.resetMs ?? 1500
  const state = shallowRef<CopyState>('idle')
  let resetTimer: ReturnType<typeof setTimeout> | undefined

  function clearResetTimer() {
    if (!resetTimer) {
      return
    }

    clearTimeout(resetTimer)
    resetTimer = undefined
  }

  function reset() {
    clearResetTimer()
    state.value = 'idle'
  }

  function scheduleReset() {
    clearResetTimer()
    resetTimer = setTimeout(() => {
      state.value = 'idle'
      resetTimer = undefined
    }, resetMs)
  }

  async function copy(handler: () => void | Promise<void>) {
    clearResetTimer()
    state.value = 'loading'

    try {
      await handler()
      state.value = 'copied'
    } catch {
      state.value = 'failed'
    } finally {
      scheduleReset()
    }
  }

  onBeforeUnmount(() => {
    clearResetTimer()
  })

  return {
    state: readonly(state),
    copy,
    reset,
  }
}
