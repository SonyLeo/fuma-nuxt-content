export async function writeDocsClipboardText(text: string) {
  if (!import.meta.client) {
    throw new Error('Clipboard is only available in the browser.')
  }

  const clipboard = window.navigator?.clipboard

  if (clipboard?.writeText) {
    await clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.inset = '0 auto auto 0'
  textarea.style.width = '1px'
  textarea.style.height = '1px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    const copied = document.execCommand('copy')

    if (!copied) {
      throw new Error('Copy command was rejected.')
    }
  } finally {
    document.body.removeChild(textarea)
  }
}
