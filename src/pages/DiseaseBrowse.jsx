import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import DiseaseCard from '../components/diseases/DiseaseCard.jsx'
import { medlineplus, DISEASE_BROWSE_OPTIONS } from '../services/medlineplus.js'

const PAGE_SIZE = 12

export default function DiseaseBrowse() {
  const [specialty, setSpecialty] = useState('all')
  const [page, setPage] = useState(0)
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const ac = new AbortController()
    setError(null)
    setItems(null)
    setPage(0)
    medlineplus
      .browse({ specialty, signal: ac.signal })
      .then(res => {
        if (ac.signal.aborted) return
        if (res?.error) {
          setError(res.message || 'Unable to load conditions.')
          return
        }
        const arr = Array.isArray(res) ? res : []
        const seen = new Set()
        const unique = []
        for (const item of arr) {
          const key = item.id || item.title
          if (!seen.has(key)) {
            seen.add(key)
            unique.push(item)
          }
        }
        setItems(unique)
      })
      .catch(() => {
        if (!ac.signal.aborted) setError('Unable to load conditions.')
      })
    return () => ac.abort()
  }, [specialty])

  const list = Array.isArray(items) ? items : []
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const slice = list.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  return (
    <>
      <Nav />
      <main className="browse-page browse-page--disease">
        <header className="browse-header">
          <h1 className="browse-title">Browse conditions</h1>
          <p className="browse-lead">MedlinePlus health topics — filter by specialty area, paginated locally.</p>
          <Link to="/" className="browse-back">← Back to search</Link>
        </header>

        <div className="browse-toolbar">
          <label className="browse-field browse-field--grow">
            <span className="browse-label">Specialty</span>
            <select
              className="browse-select"
              value={specialty}
              onChange={e => { setSpecialty(e.target.value); setPage(0) }}
              aria-label="Filter by specialty"
            >
              {DISEASE_BROWSE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>

        {error && <div className="browse-error" role="alert">{error}</div>}

        {items === null && !error && (
          <div className="browse-loading" aria-busy="true">Loading…</div>
        )}

        {items !== null && !error && (
          <>
            <p className="browse-meta">
              {list.length === 0
                ? 'No results for this filter.'
                : `Showing ${currentPage * PAGE_SIZE + 1}–${currentPage * PAGE_SIZE + slice.length} of ${list.length}`}
            </p>
            <div className="browse-list">
              {!slice.length ? (
                <p className="browse-empty">
                  No conditions found for this specialty.
                </p>
              ) : (
                slice.map((disease, i) => (
                  <DiseaseCard
                    key={disease.id != null ? disease.id : `${disease.title}-${i}`}
                    disease={disease}
                    idx={currentPage * PAGE_SIZE + i}
                  />
                ))
              )}
            </div>
            {list.length > PAGE_SIZE && (
              <nav className="browse-pager" aria-label="Pagination">
                <button
                  type="button"
                  className="browse-page-btn"
                  disabled={currentPage <= 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  Previous
                </button>
                <span className="browse-page-status">
                  Page {currentPage + 1} / {pageCount}
                </span>
                <button
                  type="button"
                  className="browse-page-btn"
                  disabled={currentPage >= pageCount - 1}
                  onClick={() => setPage(p => Math.min(p + 1, pageCount - 1))}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </>
  )
}
