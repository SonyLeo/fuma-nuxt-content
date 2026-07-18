import { Blob as NodeBlob, Buffer as NodeBuffer } from 'node:buffer'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { DecompressionStream as NodeDecompressionStream } from 'node:stream/web'
import { decompressTree } from '@nuxt/content/runtime'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { queryCollection } from '#imports'
import { describe, expect, test, vi } from 'vitest'
import remarkDocsMarkdownImages, {
  applyDocsMarkdownImageMetadata,
  transformDocsMarkdownImages,
} from '~/utils/docs-markdown-images'

type CompressedMarkdownTree = Parameters<typeof decompressTree>[0]

type TestMarkdownNode = {
  type: string
  url?: string
  alt?: string | null
  title?: string | null
  data?: {
    hProperties?: Record<string, unknown>
  }
  props?: Record<string, unknown>
  tag?: string
  children?: TestMarkdownNode[]
}

type TestMarkdownRoot = TestMarkdownNode & {
  type: 'root'
  children: TestMarkdownNode[]
}

const compressedContentDumpPath = resolve(
  process.cwd(),
  '.nuxt/content/database.compressed.mjs',
)

async function readCompressedDocsDump() {
  const source = await readFile(compressedContentDumpPath, 'utf8')
  const match = source.match(/export const docs = "([^"]+)"/)

  if (!match?.[1]) {
    throw new Error('Unable to read compressed docs content dump')
  }

  return match[1]
}

function installNodeDecompressionStream() {
  for (const target of [globalThis, window]) {
    Object.defineProperties(target, {
      Blob: { configurable: true, value: NodeBlob },
      Buffer: { configurable: true, value: NodeBuffer },
      DecompressionStream: {
        configurable: true,
        value: NodeDecompressionStream,
      },
    })
  }
}

function image(url: string, alt: string, title?: string): TestMarkdownNode {
  return {
    type: 'image',
    url,
    alt,
    ...(title ? { title } : {}),
  }
}

function root(children: TestMarkdownNode[]): TestMarkdownRoot {
  return { type: 'root', children }
}

function collectNodes(
  node: TestMarkdownNode,
  predicate: (node: TestMarkdownNode) => boolean,
): TestMarkdownNode[] {
  return [
    ...(predicate(node) ? [node] : []),
    ...(node.children ?? []).flatMap((child) => collectNodes(child, predicate)),
  ]
}

function parseDocsMarkdown(markdown: string) {
  return parseMarkdown(
    markdown,
    {
      remark: {
        plugins: {
          remarkDocsMarkdownImages: {
            instance: remarkDocsMarkdownImages,
          },
        },
      },
    },
    {
      fileOptions: {
        path: resolve(process.cwd(), 'content/guide/image-probe.md'),
      },
    },
  )
}

describe('docs Markdown image transform', () => {
  registerEndpoint('/__nuxt_content/docs/sql_dump.txt', async () => {
    return new Response(await readCompressedDocsDump(), {
      headers: { 'content-type': 'text/plain' },
    })
  })

  test('pure: applies canonical metadata with title-first caption mapping', () => {
    const titled = image('/diagram.svg', 'Accessible diagram', 'Diagram title')
    const fallback = image('/fallback.ico', 'Fallback caption')

    applyDocsMarkdownImageMetadata(titled, { width: 960, height: 540 })
    applyDocsMarkdownImageMetadata(fallback, { width: 32, height: 32 })

    expect(titled).toMatchObject({
      url: '/diagram.svg',
      alt: 'Accessible diagram',
      title: 'Diagram title',
      data: {
        hProperties: {
          src: '/diagram.svg',
          width: '960',
          height: '540',
          caption: 'Diagram title',
        },
      },
    })
    expect(fallback.data?.hProperties).toMatchObject({
      src: '/fallback.ico',
      width: '32',
      height: '32',
      caption: 'Fallback caption',
    })
    expect(titled.data?.hProperties).not.toHaveProperty('placeholder')
    expect(titled.data?.hProperties).not.toHaveProperty('blurDataURL')
  })

  test('focused: reads local SVG and ICO dimensions while preserving passthrough URLs', async () => {
    const localSvg = image(
      '/docs-image-zoom-sample.svg',
      'Docs diagram',
      'Docs shell regions',
    )
    const localIco = image('/favicon.ico', 'TinyRobot favicon')
    const external = image('https://example.com/remote.png', 'Remote image')
    const relative = image('./relative.png', 'Relative image')
    const protocolRelative = image('//cdn.example.com/image.png', 'CDN image')
    const tree = root([
      {
        type: 'paragraph',
        children: [localSvg, localIco, external, relative, protocolRelative],
      },
    ])
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    try {
      await transformDocsMarkdownImages(tree)
      const firstPass = JSON.stringify(tree)

      expect(localSvg.data?.hProperties).toMatchObject({
        src: '/docs-image-zoom-sample.svg',
        width: '960',
        height: '540',
        caption: 'Docs shell regions',
      })
      expect(localIco.data?.hProperties).toMatchObject({
        src: '/favicon.ico',
        width: '32',
        height: '32',
        caption: 'TinyRobot favicon',
      })
      expect(external.data).toBeUndefined()
      expect(relative.data).toBeUndefined()
      expect(protocolRelative.data).toBeUndefined()
      expect(fetchSpy).not.toHaveBeenCalled()

      await transformDocsMarkdownImages(tree)
      expect(JSON.stringify(tree)).toBe(firstPass)
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test('focused: compiles canonical image props without placeholders or remote fetches', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    try {
      const parsed = await parseDocsMarkdown(`
![Accessible diagram](/docs-image-zoom-sample.svg "Docs shell regions")

![TinyRobot favicon](/favicon.ico)

![Remote image](https://example.com/remote.png)

![Relative image](./relative.png)
`)
      const body = parsed.body as unknown as TestMarkdownNode
      const images = collectNodes(body, (node) => node.tag === 'img')

      expect(images.map((node) => node.props)).toEqual([
        {
          alt: 'Accessible diagram',
          caption: 'Docs shell regions',
          height: 540,
          src: '/docs-image-zoom-sample.svg',
          title: 'Docs shell regions',
          width: 960,
        },
        {
          alt: 'TinyRobot favicon',
          caption: 'TinyRobot favicon',
          height: 32,
          src: '/favicon.ico',
          width: 32,
        },
        {
          alt: 'Remote image',
          src: 'https://example.com/remote.png',
        },
        {
          alt: 'Relative image',
          src: './relative.png',
        },
      ])
      expect(JSON.stringify(images)).not.toContain('placeholder')
      expect(JSON.stringify(images)).not.toContain('blurDataURL')
      expect(fetchSpy).not.toHaveBeenCalled()
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test('focused: fails fast for missing and undecodable local images', async () => {
    await expect(
      transformDocsMarkdownImages(
        root([image('/%2e%2e/outside.png', 'Outside public directory')]),
      ),
    ).rejects.toThrow(
      /Root-relative image URL "\/%2e%2e\/outside\.png" resolves outside public directory/,
    )

    await expect(
      transformDocsMarkdownImages(
        root([image('/missing-image.png', 'Missing image')]),
      ),
    ).rejects.toThrow(
      /Failed to read dimensions.*missing-image\.png.*supported, decodable image/,
    )

    const publicDir = await mkdtemp(join(tmpdir(), 'docs-images-'))

    try {
      await writeFile(join(publicDir, 'broken.png'), 'not an image')

      await expect(
        transformDocsMarkdownImages(
          root([image('/broken.png', 'Broken image')]),
          { publicDir },
        ),
      ).rejects.toThrow(
        /Failed to read dimensions.*broken\.png.*supported, decodable image/,
      )
    } finally {
      await rm(publicDir, { recursive: true, force: true })
    }
  })

  test('collection closeout: preserves canonical Markdown image metadata', async () => {
    installNodeDecompressionStream()
    window.localStorage.removeItem('content_checksum_docs')
    window.localStorage.removeItem('content_collection_docs')

    const page = await queryCollection('docs')
      .path('/guide/zoomable-image')
      .first()

    expect(page).toBeTruthy()

    const body = page?.body as unknown as TestMarkdownNode
    const renderedBody =
      body.type === 'minimark'
        ? (decompressTree(
            body as unknown as CompressedMarkdownTree,
          ) as TestMarkdownNode)
        : body
    const markdownImage = collectNodes(
      renderedBody,
      (node) =>
        node.tag === 'img' && node.props?.src === '/docs-image-zoom-sample.svg',
    )[0]

    expect(markdownImage?.props).toMatchObject({
      alt: 'Docs layout sample diagram',
      caption: 'Docs shell regions',
      height: 540,
      src: '/docs-image-zoom-sample.svg',
      title: 'Docs shell regions',
      width: 960,
    })
    expect(markdownImage?.props).not.toHaveProperty('placeholder')
    expect(markdownImage?.props).not.toHaveProperty('blurDataURL')
  })
})
