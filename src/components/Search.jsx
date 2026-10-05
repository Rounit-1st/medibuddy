import { useState } from 'react'

export default function Search({ search, loading, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue)

  function submit(event) {
    event.preventDefault()
    search(query)
  }

  return <form className="search-form" onSubmit={submit} role="search">
    <span className="search-icon" aria-hidden="true">⌕</span>
    <input aria-label="Medicine brand name" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Enter a brand name…" />
    <button type="submit" className="primary-button" disabled={loading || !query.trim()}>{loading ? 'Searching…' : 'Search'}<span aria-hidden="true">→</span></button>
  </form>
}
