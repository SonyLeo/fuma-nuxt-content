import { isAbsolute, relative, resolve, sep } from 'node:path'
import { imageSizeFromFile } from 'image-size/fromFile'

type MarkdownNodeData = {
  hProperties?: Record<string, unknown>
}

type MarkdownNode = {
  type: string
  url?: string
  alt?: string | null
  title?: string | null
  data?: MarkdownNodeData
  children?: MarkdownNode[]
}

type MarkdownRoot = MarkdownNode & {
  type: 'root'
  children: MarkdownNode[]
}

type ImageDimensions = {
  width: number
  height: number
}

export type DocsMarkdownImagesOptions = {
  publicDir?: string
}

function isRootRelativePublicImage(src: string) {
  return src.startsWith('/') && !src.startsWith('//')
}

function resolvePublicImagePath(src: string, publicDir: string) {
  const encodedPath = src.split(/[?#]/, 1)[0] ?? src
  let decodedPath: string

  try {
    decodedPath = decodeURIComponent(encodedPath).replace(/\\/g, '/')
  } catch (cause) {
    throw new Error(
      `[Docs Markdown Images] Cannot decode root-relative image URL "${src}".`,
      { cause },
    )
  }

  const resolvedPublicDir = resolve(publicDir)
  const imagePath = resolve(resolvedPublicDir, `.${decodedPath}`)
  const relativePath = relative(resolvedPublicDir, imagePath)

  if (
    relativePath === '..' ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    throw new Error(
      `[Docs Markdown Images] Root-relative image URL "${src}" resolves outside public directory "${resolvedPublicDir}".`,
    )
  }

  return { imagePath, resolvedPublicDir }
}

export function applyDocsMarkdownImageMetadata(
  node: MarkdownNode,
  dimensions: ImageDimensions,
) {
  if (node.type !== 'image' || typeof node.url !== 'string') {
    return
  }

  node.data ??= {}
  node.data.hProperties ??= {}
  node.data.hProperties.src = node.url
  node.data.hProperties.width = String(dimensions.width)
  node.data.hProperties.height = String(dimensions.height)
  node.data.hProperties.caption = node.title ?? node.alt ?? ''
}

export async function transformDocsMarkdownImages(
  tree: MarkdownRoot,
  options: DocsMarkdownImagesOptions = {},
) {
  const publicDir = options.publicDir ?? resolve(process.cwd(), 'public')
  const images: MarkdownNode[] = []

  function collectImages(node: MarkdownNode) {
    if (
      node.type === 'image' &&
      typeof node.url === 'string' &&
      isRootRelativePublicImage(node.url)
    ) {
      images.push(node)
    }

    node.children?.forEach(collectImages)
  }

  collectImages(tree)

  await Promise.all(
    images.map(async (node) => {
      const src = node.url as string
      const { imagePath, resolvedPublicDir } = resolvePublicImagePath(
        src,
        publicDir,
      )

      let dimensions: ImageDimensions

      try {
        dimensions = await imageSizeFromFile(imagePath)
      } catch (cause) {
        throw new Error(
          `[Docs Markdown Images] Failed to read dimensions for root-relative image "${src}" at "${imagePath}" (public directory: "${resolvedPublicDir}"). Ensure the file exists and is a supported, decodable image.`,
          { cause },
        )
      }

      applyDocsMarkdownImageMetadata(node, dimensions)
    }),
  )
}

export default function remarkDocsMarkdownImages(
  options: DocsMarkdownImagesOptions = {},
) {
  return async (tree: MarkdownRoot) => {
    await transformDocsMarkdownImages(tree, options)
  }
}
