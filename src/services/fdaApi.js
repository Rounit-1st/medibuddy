/**
 * FDA Open Data API Service with in-memory caching and safe response parsing.
 */

const BASE_API_URL = 'https://api.fda.gov/drug/label.json'
const queryCache = new Map()

/**
 * Safely extracts array or single value into a clean array of non-empty strings.
 * @param {*} value - The raw field from FDA API.
 * @returns {string[]}
 */
export function extractArray(value) {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item.trim() : String(item))).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()]
  }
  return []
}

/**
 * Formats a field safely with fallback if missing or empty.
 * @param {object} obj - Object containing the key (e.g. openfda).
 * @param {string} key - Field name.
 * @param {string} fallback - Fallback string when field is missing.
 * @param {string} separator - Separator for multiple values.
 * @returns {string}
 */
export function formatField(obj, key, fallback = 'Not listed', separator = ', ') {
  const list = extractArray(obj?.[key])
  return list.length > 0 ? list.join(separator) : fallback
}

/**
 * Search drugs by brand name from openfda.
 * @param {string} brandName - Brand name to search for.
 * @param {number} limit - Number of results to fetch (default: 20).
 * @param {AbortSignal} signal - Optional abort signal.
 * @returns {Promise<{ results: Array, total: number }>}
 */
export async function searchByBrandName(brandName, limit = 20, signal = null) {
  const normalizedQuery = brandName.trim().toLowerCase()
  if (!normalizedQuery) {
    return { results: [], total: 0 }
  }

  const cacheKey = `search:${normalizedQuery}:${limit}`
  if (queryCache.has(cacheKey)) {
    return queryCache.get(cacheKey)
  }

  const url = new URL(BASE_API_URL)
  url.searchParams.set('search', `openfda.brand_name:"${encodeURIComponent(normalizedQuery).replace(/%20/g, '+')}"`)
  url.searchParams.set('limit', String(limit))

  try {
    const response = await fetch(url.toString(), { signal })

    // FDA API returns HTTP 404 with error payload when no matching records exist
    if (response.status === 404) {
      const emptyResult = { results: [], total: 0 }
      queryCache.set(cacheKey, emptyResult)
      return emptyResult
    }

    if (!response.ok) {
      throw new Error(`FDA API request failed with status ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    // Filter out items that do not have an openfda object as required by step 2
    const items = (data.results || []).filter((item) => item && item.openfda && Object.keys(item.openfda).length > 0)

    const payload = {
      results: items,
      total: data.meta?.results?.total || items.length,
    }

    queryCache.set(cacheKey, payload)
    return payload
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }
    throw new Error(error.message || 'Unable to fetch medicine records from FDA database.', { cause: error })
  }
}

/**
 * Fetch medicine details by brand name, product NDC, or SPL ID.
 * @param {string} brand - Brand name.
 * @param {string} ndc - Optional NDC code.
 * @param {string} id - Optional record ID.
 * @param {AbortSignal} signal - Optional abort signal.
 * @returns {Promise<object|null>}
 */
export async function fetchMedicineDetail({ brand, ndc, id }, signal = null) {
  const cacheKey = `detail:${brand || ''}:${ndc || ''}:${id || ''}`
  if (queryCache.has(cacheKey)) {
    return queryCache.get(cacheKey)
  }

  let searchQuery
  if (ndc) {
    searchQuery = `openfda.product_ndc:"${ndc}"`
  } else if (brand) {
    searchQuery = `openfda.brand_name:"${encodeURIComponent(brand.trim()).replace(/%20/g, '+')}"`
  } else if (id) {
    searchQuery = `id:"${id}"`
  } else {
    return null
  }

  const url = new URL(BASE_API_URL)
  url.searchParams.set('search', searchQuery)
  url.searchParams.set('limit', '10')

  try {
    const response = await fetch(url.toString(), { signal })
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      throw new Error(`FDA API error (${response.status})`)
    }

    const data = await response.json()
    const results = data.results || []

    // Look for exact match if possible
    let matched = null
    if (ndc) {
      matched = results.find((item) =>
        extractArray(item?.openfda?.product_ndc).some((code) => code.toLowerCase() === ndc.toLowerCase())
      )
    }
    if (!matched && id) {
      matched = results.find((item) => item?.id === id || item?.set_id === id)
    }
    if (!matched && brand) {
      matched = results.find((item) =>
        extractArray(item?.openfda?.brand_name).some((b) => b.toLowerCase() === brand.toLowerCase())
      )
    }
    if (!matched && results.length > 0) {
      matched = results[0]
    }

    if (matched) {
      queryCache.set(cacheKey, matched)
    }
    return matched
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error(error.message || 'Error loading medicine detail', { cause: error })
  }
}
