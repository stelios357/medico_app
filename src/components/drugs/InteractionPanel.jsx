import { useState } from 'react'
import InteractionForm from './InteractionForm.jsx'
import InteractionResults from './InteractionResults.jsx'

export default function InteractionPanel({ drugName, onClose }) {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleResults(res) {
    setResults(res)
  }

  return (
    <div className="ix-panel" role="region" aria-label="Interaction checker">
      <div className="ix-panel-header">
        <div className="ix-panel-title-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <h3 className="ix-panel-title">Interaction Checker</h3>
        </div>
        <button
          type="button"
          className="ix-panel-close"
          onClick={onClose}
          aria-label="Close interaction checker"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div className="ix-panel-body">
        <InteractionForm
          initialDrug={drugName}
          onResults={handleResults}
          onLoading={setLoading}
        />

        {loading && (
          <div className="ix-checking" aria-live="polite">
            <span className="ix-checking-spinner" aria-hidden="true" />
            Checking interactions…
          </div>
        )}

        {results !== null && !loading && (
          <InteractionResults results={results} />
        )}
      </div>
    </div>
  )
}
