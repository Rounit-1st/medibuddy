import { useCallback, useEffect, useState } from 'react'
import './App.css'
import Search from './components/Search'

const API = 'https://api.fda.gov/drug/label.json'

function values(value) {
  if (!Array.isArray(value)) return value ? [value] : []
  return value.filter(Boolean)
}

function field(openfda, key, fallback = 'Not listed') {
  return values(openfda?.[key]).join(', ') || fallback
}

function App() {
  const [route, setRoute] = useState(window.location.pathname)
  const [results, setResults] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailStatus, setDetailStatus] = useState('loading')

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((path) => {
    window.history.pushState({}, '', path)
    setRoute(window.location.pathname)
    window.scrollTo(0, 0)
  }, [])

  async function searchMedicines(input) {
    const term = input.trim()
    if (!term) return
    setQuery(term)
    setStatus('loading')
    setError('')
    const url = new URL(API)
    url.searchParams.set('search', `openfda.brand_name:"${term}"`)
    url.searchParams.set('limit', '20')
    try {
      const response = await fetch(url)
      if (response.status === 404) {
        setResults([])
        setStatus('empty')
        return
      }
      if (!response.ok) throw new Error('The medicine database could not be reached. Please try again.')
      const data = await response.json()
      const found = (data.results || []).filter((item) => item?.openfda)
      setResults(found)
      setStatus(found.length ? 'results' : 'empty')
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  useEffect(() => {
    if (!route.startsWith('/medicine/')) return
    const params = new URLSearchParams(window.location.search)
    const brand = params.get('brand')
    const manufacturer = params.get('manufacturer') || ''
    if (!brand) return
    let active = true
    const url = new URL(API)
    url.searchParams.set('search', `openfda.brand_name:"${brand}"`)
    url.searchParams.set('limit', '20')
    fetch(url).then(async (response) => {
      if (!response.ok) throw new Error(response.status === 404 ? 'Medicine not found' : 'Could not load this medicine.')
      const data = await response.json()
      const match = (data.results || []).find((item) => {
        const fd = item?.openfda || {}
        return values(fd.brand_name).some((name) => name.toLowerCase() === brand.toLowerCase()) &&
          (!manufacturer || values(fd.manufacturer_name).some((name) => name === manufacturer))
      }) || (data.results || []).find((item) => item?.openfda)
      if (!match) throw new Error('Medicine not found')
      if (active) { setDetail(match.openfda); setDetailStatus('ready') }
    }).catch((requestError) => {
      if (active) { setError(requestError.message); setDetailStatus('error') }
    })
    return () => { active = false }
  }, [route])

  const openMedicine = (openfda) => {
    const brand = values(openfda.brand_name)[0]
    const manufacturer = values(openfda.manufacturer_name)[0]
    const params = new URLSearchParams({ brand, ...(manufacturer ? { manufacturer } : {}) })
    navigate(`/medicine/${encodeURIComponent(brand)}?${params.toString()}`)
  }

  const isDetail = route.startsWith('/medicine/')

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand-mark" href="/" onClick={(event) => { event.preventDefault(); navigate('/') }} aria-label="MediBuddy home">
          <span className="brand-icon">✚</span><span>Medi<span>Buddy</span></span>
        </a>
        <span className="header-note">Medicine information, made easier</span>
      </header>

      {isDetail ? (
        <section className="detail-page">
          <button className="back-link" onClick={() => navigate('/')}>← Back to search</button>
          {detailStatus === 'loading' && <div className="state-panel"><span className="spinner" />Loading medicine details…</div>}
          {(detailStatus === 'error' || !new URLSearchParams(window.location.search).get('brand')) && <div className="state-panel error-panel"><h2>{detailStatus === 'error' ? error : 'Medicine link is incomplete'}</h2><p>Search for a medicine to view its details.</p><button className="primary-button" onClick={() => navigate('/')}>Back to search</button></div>}
          {detailStatus === 'ready' && detail && <>
            <div className="detail-heading"><p className="eyebrow">MEDICINE DETAILS</p><h1>{field(detail, 'brand_name', 'Medicine')}</h1><p className="detail-subtitle">{field(detail, 'generic_name', 'Generic name not listed')}</p></div>
            <section className="detail-card">
              <h2>Product information</h2>
              <div className="detail-grid">
                <DetailField label="Manufacturer" value={field(detail, 'manufacturer_name')} />
                <DetailField label="Product type" value={field(detail, 'product_type')} />
                <DetailField label="Route" value={field(detail, 'route')} />
                <DetailField label="Dosage form" value={field(detail, 'dosage_form')} />
                <DetailField label="Active ingredients" value={field(detail, 'substance_name')} />
                <DetailField label="Product NDC" value={field(detail, 'product_ndc')} />
                <DetailField label="Application number" value={field(detail, 'application_number')} />
                <DetailField label="Package NDC" value={field(detail, 'package_ndc')} />
              </div>
            </section>
            <p className="source-note">Product information provided by the FDA open data API.</p>
          </>}
        </section>
      ) : (
        <>
          <section className="hero-section">
            {/* <div className="hero-copy"><span className="eyebrow">YOUR MEDICINE SEARCH</span><h1>Find the medicine<br /><span>you’re looking for.</span></h1><p>Search by brand name to explore FDA-listed medicine products.</p></div> */}
            <Search search={searchMedicines} loading={status === 'loading'} initialValue={query} />
            {/* <div className="search-hint"><span className="shield">✓</span> Search medicine brand names, such as Advil or Tylenol</div> */}
          </section>
          <section className="results-section" aria-live="polite">
            {status === 'loading' && <div className="state-panel"><span className="spinner" />Searching the FDA database…</div>}
            {status === 'empty' && <div className="state-panel"><div className="empty-icon">⌕</div><h2>No results found</h2><p>We couldn’t find a medicine brand matching “{query}”. Check the spelling or try another brand name.</p></div>}
            {status === 'error' && <div className="state-panel error-panel"><div className="empty-icon">!</div><h2>Search couldn’t be completed</h2><p>{error}</p><button className="primary-button" onClick={() => searchMedicines(query)}>Try again</button></div>}
            {status === 'results' && <><div className="results-title"><div><p className="eyebrow">SEARCH RESULTS</p><h2>Medicines matching “{query}”</h2></div><span className="result-count">{results.length} {results.length === 1 ? 'result' : 'results'}</span></div><div className="result-list">{results.map((item, index) => <MedicineCard key={`${values(item.openfda.brand_name)[0]}-${values(item.openfda.product_ndc)[0]}-${index}`} openfda={item.openfda} onClick={() => openMedicine(item.openfda)} />)}</div></>}
            {status === 'idle' && <div className="welcome-panel"><div className="welcome-art"><span>✚</span></div><div><h2>Start with a brand name</h2><p>Your search results will appear here, with useful product details at a glance.</p></div></div>}
          </section>
        </>
      )}
      <footer className="site-footer"><span>✚ MediBuddy</span><span>Medicine data from the FDA open data API</span></footer>
    </main>
  )
}

function MedicineCard({ openfda, onClick }) {
  return <button className="medicine-card" onClick={onClick}>
    <span className="medicine-symbol">✚</span>
    <span className="medicine-main"><strong>{field(openfda, 'brand_name', 'Unknown brand')}</strong><span className="generic-name">{field(openfda, 'generic_name', 'Generic name not listed')}</span><span className="manufacturer">{field(openfda, 'manufacturer_name', 'Manufacturer not listed')}</span></span>
    <span className="medicine-meta"><span className="tag">{field(openfda, 'product_type', 'Product type not listed')}</span><span className="route-label">{field(openfda, 'route', 'Route not listed')}</span></span>
    <span className="card-arrow">→</span>
  </button>
}

function DetailField({ label, value }) {
  return <div className="detail-field"><span>{label}</span><strong>{value}</strong></div>
}

export default App
