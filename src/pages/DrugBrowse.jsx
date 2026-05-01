import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import DrugCard from '../components/drugs/DrugCard.jsx'
import { openFDA } from '../services/openFDA.js'

function formatClassLabel(label) {
  return label.replace(/\s*\[EPC\]$/, '')
}

const PAGE_SIZE = 20

export default function DrugBrowse() {
  const [page, setPage] = useState(0)
  const [drugClass, setDrugClass] = useState('')
  const [rxFilter, setRxFilter] = useState('all')
  const [classOptions, setClassOptions] = useState([])
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState(null)
  const [rateLimitWarning, setRateLimitWarning] = useState(false)

  useEffect(() => {
    const ac = new AbortController()
    openFDA.drugClassOptions(ac.signal).then(rows => {
      if (!ac.signal.aborted) setClassOptions(Array.isArray(rows) ? rows.sort((a, b) => a.localeCompare(b)) : [])
    })
    return () => ac.abort()
  }, [])

  useEffect(() => {
    const ac = new AbortController()
    setError(null)
    setPayload(null)
    openFDA
      .browse({
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
        drugClass,
        rxFilter,
        signal: ac.signal,
      })
      .then(res => {
        if (ac.signal.aborted) return
        if (res?.error) {
          setError(res.message || 'Unable to load medications.')
          return
        }
        setRateLimitWarning(openFDA.rateLimitWarning)
        setPayload(res)
      })
      .catch(() => {
        if (!ac.signal.aborted) setError('Unable to load medications.')
      })
    return () => ac.abort()
  }, [page, drugClass, rxFilter])

  const total = payload?.total ?? 0
  const results = payload?.results ?? []
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function onClassChange(e) {
    setDrugClass(e.target.value)
    setPage(0)
  }

  function onRxChange(e) {
    setRxFilter(e.target.value)
    setPage(0)
  }

  return (
    <>
      <Nav />
      <main className="browse-page">
        <header className="browse-header">
          <h1 className="browse-title">Browse medications</h1>
          <p className="browse-lead">OpenFDA drug labels — filter by class and Rx / OTC. Paginated.</p>
          <Link to="/" className="browse-back">← Back to search</Link>
        </header>

        <div className="browse-toolbar">
          <label className="browse-field">
            <span className="browse-label">Drug class</span>
            <select
              className="browse-select"
              value={drugClass}
              onChange={onClassChange}
              aria-label="Filter by drug class"
            >
              <option value="">All classes</option>
              {classOptions.map(c => (
                <option key={c} value={c}>
                  {formatClassLabel(c)}
                </option>
              ))}
            </select>
          </label>
          <label className="browse-field">
            <span className="browse-label">Availability</span>
            <select className="browse-select" value={rxFilter} onChange={onRxChange} aria-label="Rx or OTC">
              <option value="all">All</option>
              <option value="rx">Rx only</option>
              <option value="otc">OTC only</option>
            </select>
          </label>
        </div>

        {rateLimitWarning && (
          <p className="browse-notice">Data may be slightly delayed.</p>
        )}

        {error && <div className="browse-error" role="alert">{error}</div>}

        {!error && !payload && (
          <div className="browse-loading" aria-busy="true">Loading…</div>
        )}

        {payload && !error && (
          <>
            <p className="browse-meta">
              {results.length === 0
                ? 'No matching labels for these filters.'
                : `Showing ${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + results.length} of ${total.toLocaleString()}`}
            </p>
            <div className="browse-list">
              {!results.length ? (
                <p className="browse-empty">
                  No medications found for this filter.
                </p>
              ) : (
                results.map(drug => <DrugCard key={drug.id} drug={drug} />)
              )}
            </div>
            <nav className="browse-pager" aria-label="Pagination">
              <button
                type="button"
                className="browse-page-btn"
                disabled={page <= 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <span className="browse-page-status">
                Page {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                className="browse-page-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
              >
                Next
              </button>
            </nav>
          </>
        )}
      </main>
    </>
  )
}
