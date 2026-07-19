import { createError, getRequestURL, setHeader } from 'h3'
import {
  DocsSearchRequestValidationError,
  parseDocsSearchQuery,
  queryDocsSearchResults,
} from '../utils/docs-search'

export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'no-store')

  try {
    const request = parseDocsSearchQuery(getRequestURL(event).searchParams)

    return await queryDocsSearchResults(event, request)
  } catch (error) {
    if (error instanceof DocsSearchRequestValidationError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid search request',
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Search request failed',
    })
  }
})
