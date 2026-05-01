import { useState } from 'react'
import Nav from '../components/Nav.jsx'
import ClinicalDisclaimer from '../components/common/ClinicalDisclaimer.jsx'
import InteractionForm from '../components/drugs/InteractionForm.jsx'
import InteractionResults from '../components/drugs/InteractionResults.jsx'

export default function InteractionChecker() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleResults(res) {
    setResults(res)
  }

  return (
    <>
      <Nav />
      <main className="ix-page">
        <ClinicalDisclaimer
          className="dd-disclaimer-wrap"
          textClassName="dd-disclaimer-text"
          iconClassName="dd-disclaimer-icon"
        />
        <div className="ix-page-inner">
          <header className="ix-page-header">
            <h1 className="ix-page-title">Drug Interaction Checker</h1>
            <p className="ix-page-sub">
              Add 2–5 drugs to check for known interactions. Select each drug from the autocomplete — always verify results with a pharmacist.
            </p>
          </header>

          <div className="ix-page-card">
            <InteractionForm
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
      </main>
    </>
  )
}
