import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClinicalDisclaimer from '../components/common/ClinicalDisclaimer.jsx'
import DrugHighlights from '../components/drugs/DrugHighlights.jsx'
import DrugAccordion from '../components/drugs/DrugAccordion.jsx'
import DrugSkeleton from '../components/drugs/DrugSkeleton.jsx'
import { openFDA } from '../services/openFDA.js'
import { isFallback } from '../services/fallback.js'

export default function DrugDetail() {
  const { id } = useParams()
  const [drug, setDrug] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)

    const controller = new AbortController()
    const { signal } = controller
    setDrug(null)
    setError(null)

    openFDA.detail(id, signal).then(result => {
      if (signal.aborted) return
      if (isFallback(result)) {
        setError(result.message)
      } else if (!result || (!result.id && !result.brandName && !result.genericName)) {
        setError('Drug information not found.')
      } else {
        setDrug(result)
      }
    }).catch(err => {
      if (signal.aborted) return
      setError('Unable to load drug information. Please try again.')
    })

    return () => controller.abort()
  }, [id])

  return (
    <>
      <Nav />
      <main className="dd-page">
        <ClinicalDisclaimer />

        {drug === null && error === null && <DrugSkeleton />}

        {error && (
          <div className="dd-error">
            <h2 className="dd-error-title">Unable to load drug information</h2>
            <p className="dd-error-msg">{error}</p>
            <Link to="/" className="dd-back-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
              Back to search
            </Link>
          </div>
        )}

        {drug && (
          <div className="dd-container">
            <DrugHighlights drug={drug} />

            <div className="dd-actions">
              <button className="dd-btn dd-btn-interaction" type="button" disabled>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                Check Interactions
              </button>
              <button className="dd-btn dd-btn-save" type="button" disabled>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                Save
              </button>
            </div>

            <DrugAccordion drug={drug} />
          </div>
        )}
      </main>
    </>
  )
}
