import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClinicalDisclaimer from '../components/common/ClinicalDisclaimer.jsx'
import DiseaseHighlights from '../components/diseases/DiseaseHighlights.jsx'
import DiseaseAccordion from '../components/diseases/DiseaseAccordion.jsx'
import DiseaseSkeleton from '../components/diseases/DiseaseSkeleton.jsx'
import { medlineplus } from '../services/medlineplus.js'
import { isFallback } from '../services/fallback.js'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js'
import { useSaved } from '../hooks/useSaved.js'

function diseaseStableId(disease, idParam) {
  return disease?.id != null && String(disease.id).trim() !== ''
    ? String(disease.id)
    : idParam
}

export default function DiseaseDetail() {
  const { id: idParam } = useParams()
  const navigate = useNavigate()
  const [disease, setDisease] = useState(null)
  const [error, setError] = useState(null)

  const recentlyViewed = useRecentlyViewed()
  const { toggle, isItemSaved } = useSaved()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [idParam])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    setDisease(null)
    setError(null)

    const lookupId = idParam != null ? String(idParam) : ''

    medlineplus.detail(lookupId, signal).then(result => {
      if (signal.aborted) return
      if (isFallback(result)) {
        setError(result.message)
        return
      }
      const data = result
      if (!data || !data.title) {
        setError(true)
        return
      }
      setDisease(data)
    }).catch(() => {
      if (signal.aborted) return
      setError('Unable to load condition information. Please try again.')
    })

    return () => controller.abort()
  }, [idParam])

  const stableId = disease ? diseaseStableId(disease, idParam) : null
  const encodedId =
    stableId != null && String(stableId).trim() !== ''
      ? encodeURIComponent(stableId)
      : null
  const detailPath = encodedId ? `/disease/${encodedId}` : null

  useEffect(() => {
    if (!disease || !detailPath) return
    recentlyViewed.add({
      name: disease.title || 'Condition',
      route: detailPath,
      type: 'disease',
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disease, detailPath])

  const saved =
    disease && encodedId ? isItemSaved(encodedId) : false

  function handleSave() {
    if (!disease || !encodedId || !detailPath) return
    toggle({
      id: encodedId,
      name: disease.title || 'Condition',
      type: 'disease',
      route: detailPath,
    })
  }

  function handleSearchRelatedDrugs() {
    const name = disease?.title?.trim()
    if (!name) return
    navigate('/', { state: { relatedDrugSearch: name } })
  }

  return (
    <>
      <Nav />
      <main className="dis-page">
        <ClinicalDisclaimer
          className="dis-disclaimer-wrap"
          textClassName="dis-disclaimer-text"
          iconClassName="dis-disclaimer-icon"
        />

        {disease === null && error === null && <DiseaseSkeleton />}

        {error && (
          <div className="dis-error">
            <h2 className="dis-error-title">Unable to load condition information</h2>
            <p className="dis-error-msg">{error}</p>
            <Link to="/" className="dis-back-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
              Back to search
            </Link>
          </div>
        )}

        {disease && (
          <div className="dis-container">
            <DiseaseHighlights disease={disease} />

            <div className="dis-actions">
              <button
                className="dis-btn dis-btn-related"
                type="button"
                onClick={handleSearchRelatedDrugs}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Search related drugs
              </button>
              <button
                className={`dis-btn dis-btn-save${saved ? ' dis-btn-save--saved' : ''}`}
                type="button"
                onClick={handleSave}
                aria-pressed={saved}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>

            <DiseaseAccordion disease={disease} />

            {disease.url && (
              <p className="dis-external-wrap">
                <a
                  className="dis-external-link"
                  href={disease.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read full reference on MedlinePlus ↗
                </a>
              </p>
            )}
          </div>
        )}
      </main>
    </>
  )
}
