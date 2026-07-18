import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers'
import type { MdcConfig } from '@nuxtjs/mdc'

export const docsMarkdownCodeHighlight = {
  theme: {
    default: 'catppuccin-latte',
    light: 'catppuccin-latte',
    dark: 'catppuccin-mocha',
  },
}

export const docsMarkdownCodeSystem: MdcConfig = {
  shiki: {
    transformers: [
      transformerNotationHighlight({ matchAlgorithm: 'v3' }),
      transformerNotationWordHighlight({ matchAlgorithm: 'v3' }),
      transformerNotationDiff({ matchAlgorithm: 'v3' }),
      transformerNotationFocus({ matchAlgorithm: 'v3' }),
      {
        name: 'docs:normalize-highlighted-lines',
        enforce: 'post',
        line(node) {
          const classNames = node.properties.class

          if (Array.isArray(classNames)) {
            node.properties.class = classNames.map((className) =>
              className === 'highlight' ? 'highlighted' : className,
            )
          } else if (typeof classNames === 'string') {
            node.properties.class = classNames
              .split(/\s+/)
              .map((className) =>
                className === 'highlight' ? 'highlighted' : className,
              )
              .join(' ')
          }
        },
      },
    ],
  },
}

export default docsMarkdownCodeSystem
