export function LoadingPanel({ message = 'Searching the FDA medicine database...' }) {
  return (
    <div className="state-panel loading-panel" role="status" aria-live="polite">
      <div className="spinner-large" aria-hidden="true" />
      <h3>{message}</h3>
      <p>Fetching official OpenFDA drug label records...</p>
    </div>
  )
}

export function EmptyPanel({ query, onSuggestionClick }) {
  const suggestions = ['Advil', 'Tylenol', 'Aspirin', 'Ibuprofen', 'Claritin']
  return (
    <div className="state-panel empty-panel" role="status">
      <div className="state-icon empty-icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </div>
      <h2>No medicines found</h2>
      <p>
        We couldn’t find any FDA-registered drugs under brand name <strong>“{query}”</strong>.
      </p>
      <div className="empty-tips">
        <span>Suggestions:</span>
        <ul>
          <li>Check the spelling of the brand name</li>
          <li>Try searching for another common brand name below</li>
        </ul>
        <div className="suggestion-chips mini-chips">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              className="chip"
              onClick={() => onSuggestionClick && onSuggestionClick(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ErrorPanel({ error, onRetry }) {
  return (
    <div className="state-panel error-panel" role="alert">
      <div className="state-icon error-icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h2>Search could not be completed</h2>
      <p>{error || 'An unexpected network error occurred while querying the FDA database.'}</p>
      {onRetry && (
        <button type="button" className="primary-button retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  )
}

export function WelcomePanel({ onSuggestionClick }) {
  const suggestions = ['Advil', 'Tylenol', 'Aspirin', 'Motrin', 'Claritin']
  return (
    <div className="welcome-panel">
      <div className="welcome-header">
        <div className="welcome-icon">🏥</div>
        <div>
          <h2>Explore FDA Approved Medicines</h2>
          <p>
            Search by brand name to view accurate active ingredients, manufacturer details, administration routes, and safety monograph data directly from OpenFDA.
          </p>
        </div>
      </div>
      <div className="welcome-quick-links">
        <span className="quick-label">Popular searches:</span>
        <div className="suggestion-chips">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              className="chip"
              onClick={() => onSuggestionClick && onSuggestionClick(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
