import { useState, useEffect } from 'react'

/**
 * Hook to debounce any fast-changing value.
 * @param {any} value - The input value.
 * @param {number} delay - Debounce delay in milliseconds.
 * @returns {any} - Debounced value.
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
