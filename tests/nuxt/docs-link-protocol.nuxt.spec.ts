import { Blob as NodeBlob, Buffer as NodeBuffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { DecompressionStream as NodeDecompressionStream } from 'node:stream/web'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { queryCollection } from '#imports'
import { defineComponent } from 'vue'
import { describe, expect, test } from 'vitest'
import DocCard from '~/components/content/DocCard.vue'
import DocTypeTable from '~/components/content/DocTypeTable.vue'
import DocsLink from '~/components/docs/DocsLink.vue'
import ProseA from '~/components/content/ProseA.vue'
import type { DocsContentPage, DocsPageRecord } from '~/types/docs'
import { resolveDocsLink } from '~/utils/docs-link'
import DocsCollectionContentHarness from './helpers/DocsCollectionContentHarness.vue'

type RenderedMdcNode = {
  props?: Record<string, unknown>
  children?: RenderedMdcNode[]
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

const pages: DocsPageRecord[] = [
  {
    path: '/guide',
    stem: 'guide/index',
    docsMetadata: { title: 'Guide' },
  },
  {
    path: '/guide/child',
    stem: 'guide/child',
    docsMetadata: { title: 'Child' },
  },
  {
    path: '/guide/protocol-playground/routing',
    stem: 'guide/protocol-playground/routing',
    docsMetadata: { title: 'Routing', slug: 'route-contract' },
  },
  {
    path: '/guide/protocol-playground/path-design',
    stem: 'guide/protocol-playground/路径设计',
    docsMetadata: { title: 'Path design', slug: '真实 路径' },
  },
]

const NuxtLinkStub = defineComponent({
  name: 'NuxtLink',
  inheritAttrs: false,
  props: {
    rel: String,
    target: String,
    to: {
      type: String,
      required: true,
    },
  },
  template: `<a
    v-bind="$attrs"
    data-render-owner="nuxt-link"
    :href="to"
    :target="target"
    :rel="rel"
  ><slot /></a>`,
})

describe('docs link runtime protocol', () => {
  registerEndpoint('/__nuxt_content/docs/sql_dump.txt', async () => {
    return new Response(await readCompressedDocsDump(), {
      headers: { 'content-type': 'text/plain' },
    })
  })

  test('normalizes root routes and preserves query/hash semantics', () => {
    expect(resolveDocsLink('/guide/child/?tab=api#install').href).toBe(
      '/guide/child?tab=api#install',
    )
    expect(resolveDocsLink('/指南/开始/').href).toBe(
      '/%E6%8C%87%E5%8D%97/%E5%BC%80%E5%A7%8B',
    )
    expect(resolveDocsLink('?tab=api#install').href).toBe('?tab=api#install')
    expect(resolveDocsLink('#install')).toMatchObject({
      href: '#install',
      external: false,
      hashOnly: true,
    })
  })

  test('maps root Markdown sources to index, custom, and encoded routes', () => {
    expect(resolveDocsLink('/guide/index.md', { pages }).href).toBe('/guide')
    expect(
      resolveDocsLink(
        '/guide/protocol-playground/routing.mdx?tab=api#install',
        { pages },
      ).href,
    ).toBe('/guide/protocol-playground/route-contract?tab=api#install')
    expect(
      resolveDocsLink(
        '/guide/protocol-playground/%E8%B7%AF%E5%BE%84%E8%AE%BE%E8%AE%A1.md',
        { pages },
      ).href,
    ).toBe('/guide/protocol-playground/%E7%9C%9F%E5%AE%9E%20%E8%B7%AF%E5%BE%84')
  })

  test('resolves dot and bare relative paths from source identity', () => {
    const options = {
      currentSourcePath: '/guide/link-protocol',
      pages,
    }

    expect(
      resolveDocsLink('./protocol-playground/routing.md#section', options).href,
    ).toBe('/guide/protocol-playground/route-contract#section')
    expect(
      resolveDocsLink('protocol-playground/routing#section', options).href,
    ).toBe('/guide/protocol-playground/route-contract#section')
    expect(resolveDocsLink('child.md', options).href).toBe('/guide/child')
    expect(resolveDocsLink('child#section', options).href).toBe(
      '/guide/child#section',
    )
    expect(
      resolveDocsLink('../index.md', {
        currentSourcePath: '/guide/nested/page',
        pages,
      }).href,
    ).toBe('/guide')
  })

  test('classifies explicit schemes and preserves external overrides', () => {
    for (const href of [
      'http://example.com',
      'https://example.com',
      '//example.com/path',
      'mailto:docs@example.com',
      'tel:+123456789',
      'webcal:calendar@example.com',
    ]) {
      expect(resolveDocsLink(href)).toMatchObject({
        href,
        external: true,
        target: '_blank',
      })
    }

    expect(
      resolveDocsLink('https://example.com', { external: false }),
    ).toMatchObject({
      href: 'https://example.com',
      external: false,
      target: undefined,
    })
    expect(resolveDocsLink('/guide/child', { external: true })).toMatchObject({
      href: '/guide/child',
      external: true,
      target: '_blank',
    })
  })

  test('merges author rel tokens and keeps target overrides', () => {
    expect(
      resolveDocsLink('https://example.com', {
        rel: 'ugc NoOpener ugc',
        target: '_self',
      }),
    ).toMatchObject({
      target: '_self',
      rel: 'ugc NoOpener ugc noreferrer',
    })
  })

  test('keeps unsafe scheme rejection scoped to authored Markdown', () => {
    for (const href of [
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
    ]) {
      expect(resolveDocsLink(href, { authored: true })).toMatchObject({
        href: '#',
        external: false,
        hashOnly: true,
        unsafe: true,
      })
    }

    expect(resolveDocsLink('data:text/plain,hello')).toMatchObject({
      href: 'data:text/plain,hello',
      external: true,
      unsafe: false,
    })
  })

  test('proves actual MDC unsafe href output before the Markdown adapter', async () => {
    const parsed = await parseMarkdown(`[JavaScript](<javascript:alert(1)>)

[Data](<data:text/plain,hello>)

[VBScript](<vbscript:msgbox(1)>)`)
    const body = parsed.body as unknown as RenderedMdcNode
    const links = body.children?.map(
      (paragraph) => paragraph.children?.[0]?.props?.href,
    )

    expect(links).toEqual([undefined, 'data:text/plain,hello', undefined])
  })

  test('renders external/hash links natively and internal links through NuxtLink', async () => {
    const internal = await mountSuspended(DocsLink, {
      props: {
        href: '/guide/child/',
      },
      attrs: {
        'aria-label': 'Child page',
        'data-consumer': 'fixture',
      },
      global: {
        stubs: { NuxtLink: NuxtLinkStub },
      },
    })
    const external = await mountSuspended(DocsLink, {
      props: {
        href: 'https://example.com',
        rel: 'ugc',
        target: '_self',
      },
      global: {
        stubs: { NuxtLink: NuxtLinkStub },
      },
    })
    const hash = await mountSuspended(DocsLink, {
      props: { href: '#section' },
      global: {
        stubs: { NuxtLink: NuxtLinkStub },
      },
    })

    try {
      expect(internal.get('a').attributes()).toMatchObject({
        'aria-label': 'Child page',
        'data-consumer': 'fixture',
        'data-render-owner': 'nuxt-link',
        href: '/guide/child',
      })
      expect(external.get('a').attributes()).toMatchObject({
        href: 'https://example.com',
        rel: 'ugc noreferrer noopener',
        target: '_self',
      })
      expect(external.get('a').attributes('data-render-owner')).toBeUndefined()
      expect(hash.get('a').attributes()).toMatchObject({ href: '#section' })
      expect(hash.get('a').attributes('data-render-owner')).toBeUndefined()
    } finally {
      internal.unmount()
      external.unmount()
      hash.unmount()
    }
  })

  test('keeps the ProseA contract while blocking authored data hrefs', async () => {
    const wrapper = await mountSuspended(ProseA, {
      props: {
        href: 'data:text/html,<script>alert(1)</script>',
        rel: 'ugc',
        target: '_self',
      },
      slots: {
        default: () => 'Unsafe fixture',
      },
      global: {
        stubs: { NuxtLink: NuxtLinkStub },
      },
    })

    try {
      expect(wrapper.get('a').attributes()).toMatchObject({
        href: '#',
        rel: 'ugc',
        target: '_self',
      })
    } finally {
      wrapper.unmount()
    }
  })

  test('guards authored content component links without changing normal link owners', async () => {
    const unsafeCard = await mountSuspended(DocCard, {
      props: {
        title: 'Unsafe card',
        href: 'javascript:alert(1)',
      },
      global: {
        stubs: { NuxtLink: NuxtLinkStub },
      },
    })
    const unsafeTypeTable = await mountSuspended(DocTypeTable, {
      props: {
        rows: [
          {
            name: 'unsafe',
            type: 'string',
            description: 'Unsafe link fixture',
            typeDescriptionLink: 'data:text/plain,hello',
          },
        ],
      },
      global: {
        stubs: { NuxtLink: NuxtLinkStub },
      },
    })
    const internalCard = await mountSuspended(DocCard, {
      props: {
        title: 'Internal card',
        href: '/guide/child',
      },
      global: {
        stubs: { NuxtLink: NuxtLinkStub },
      },
    })
    const externalCard = await mountSuspended(DocCard, {
      props: {
        title: 'External card',
        href: 'https://example.com',
        external: true,
      },
      global: {
        stubs: { NuxtLink: NuxtLinkStub },
      },
    })

    try {
      expect(unsafeCard.get('a').attributes()).toMatchObject({ href: '#' })
      expect(unsafeTypeTable.get('a').attributes()).toMatchObject({ href: '#' })
      expect(internalCard.get('a').attributes()).toMatchObject({
        'data-render-owner': 'nuxt-link',
        href: '/guide/child',
      })
      expect(externalCard.get('a').attributes()).toMatchObject({
        href: 'https://example.com',
        target: '_blank',
      })
      expect(
        externalCard.get('a').attributes('data-render-owner'),
      ).toBeUndefined()
    } finally {
      unsafeCard.unmount()
      unsafeTypeTable.unmount()
      internalCard.unmount()
      externalCard.unmount()
    }
  })

  test('keeps canonical links in real Nuxt Content collection rendering', async () => {
    installNodeDecompressionStream()
    window.localStorage.removeItem('content_checksum_docs')
    window.localStorage.removeItem('content_collection_docs')
    const [page, records] = await Promise.all([
      queryCollection('docs').path('/guide/link-protocol').first(),
      queryCollection('docs').select('path', 'stem', 'docsMetadata').all(),
    ])

    expect(page).toBeTruthy()

    const wrapper = await mountSuspended(DocsCollectionContentHarness, {
      props: {
        page: page as DocsContentPage,
        pages: records as DocsPageRecord[],
        sourcePath: '/guide/link-protocol',
      },
    })

    try {
      const links = Object.fromEntries(
        wrapper.findAll('a').map((link) => [
          link.text().trim(),
          {
            href: link.attributes('href'),
            rel: link.attributes('rel'),
            target: link.attributes('target'),
          },
        ]),
      )

      expect(links['Canonical route']?.href).toBe('/guide/getting-started')
      expect(links['Root Markdown source']?.href).toBe(
        '/guide/protocol-playground/route-contract#path-policy',
      )
      expect(links['Root MDX source']?.href).toBe(
        '/guide/protocol-playground/route-contract?from=mdx#path-policy',
      )
      expect(links['Dot-relative source']?.href).toBe(
        '/guide/protocol-playground/route-contract#path-policy',
      )
      expect(links['Bare relative source']?.href).toBe(
        '/guide/getting-started#%E6%9C%80%E5%B0%8F%E4%BA%A4%E4%BA%92%E9%AA%8C%E8%AF%81',
      )
      expect(links['Current query']?.href).toBe('/?mode=compact')
      expect(links['Current hash']?.href).toBe('#duplicate-heading-1')
      expect(links.HTTPS).toMatchObject({
        href: 'https://example.com',
        target: '_blank',
      })
      expect(links.HTTPS?.rel).toContain('noopener')
      expect(links.Email).toMatchObject({
        href: 'mailto:docs@example.com',
        target: '_blank',
      })
    } finally {
      wrapper.unmount()
    }
  })
})
