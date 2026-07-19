import { expect, test } from '@playwright/test'

test.describe('@fast search API transport', () => {
  test('returns a bare result array with no-store caching', async ({
    request,
  }) => {
    const emptyResponse = await request.get('/api/search')

    expect(emptyResponse.status()).toBe(200)
    expect(emptyResponse.headers()['cache-control']).toBe('no-store')
    expect(await emptyResponse.json()).toEqual([])

    const response = await request.get('/api/search', {
      params: { query: 'Keyboard flow', limit: '1', unknown: 'ignored' },
    })
    const body = await response.json()

    expect(response.status()).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body).toHaveLength(1)
    expect(body[0]).toMatchObject({
      title: 'Accordion',
      path: '/guide/component-detail',
    })
    expect(body).not.toHaveProperty('results')
  })

  test('uses canonical page-tree searchability for real content', async ({
    request,
  }) => {
    const contextResponse = await request.get('/api/search', {
      params: { query: 'Archive Note' },
    })
    const contextResults = await contextResponse.json()

    expect(contextResponse.status()).toBe(200)
    expect(contextResults).toContainEqual(
      expect.objectContaining({
        title: 'Archive Note',
        path: '/guide/protocol-playground/archive',
      }),
    )

    const unicodeResponse = await request.get('/api/search', {
      params: { query: 'breadcrumb、pager、sidebar' },
    })
    const unicodeResults = await unicodeResponse.json()

    expect(unicodeResponse.status()).toBe(200)
    expect(unicodeResults).toContainEqual(
      expect.objectContaining({
        title: 'Path Policy',
        path: '/guide/protocol-playground/%E7%9C%9F%E5%AE%9E%20%E8%B7%AF%E5%BE%84',
      }),
    )

    const hiddenResponse = await request.get('/api/search', {
      params: { query: 'Markdown semantics fixture' },
    })

    expect(hiddenResponse.status()).toBe(200)
    expect(await hiddenResponse.json()).toEqual([])
  })

  test('rejects duplicate, oversized, and invalid parameters', async ({
    request,
  }) => {
    const responses = await Promise.all([
      request.get('/api/search?query=first&query=second'),
      request.get(`/api/search?query=${'x'.repeat(201)}`),
      request.get('/api/search?query=search&limit=0'),
      request.get('/api/search?query=search&limit=1.5'),
      request.get('/api/search?query=search&limit=21'),
      request.get('/api/search?query=search&limit=8&limit=9'),
    ])

    expect(responses.map((response) => response.status())).toEqual([
      400, 400, 400, 400, 400, 400,
    ])
    for (const response of responses) {
      expect(response.headers()['cache-control']).toBe('no-store')
    }
  })
})
