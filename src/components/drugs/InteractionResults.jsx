import { isFallback } from '../../services/fallback.js'

function severityInterpretation(severity) {
  const s = (severity || '').toLowerCase()
  switch (s) {
    case 'major': return 'Avoid'
    case 'moderate': return 'Monitor'
    case 'minor': return 'Low risk'
    default: return 'Use clinical judgment'
  }
}

export default function InteractionResults({ results }) {
  if (isFallback(results)) {
    return (
      <div className="ix-results-error" role="alert">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Unable to load interaction data. Please try again.
      </div>
    )
  }

  if (!results || results.length === 0) {
    return (
      <div className="ix-no-results">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p>No known interactions found.</p>
        <p className="ix-no-results-caveat">Always verify with a pharmacist or clinical pharmacology resource before prescribing.</p>
      </div>
    )
  }

  return (
    <div className="ix-results">
      <p className="ix-results-count">{results.length} interaction{results.length !== 1 ? 's' : ''} found</p>
      <div className="ix-table-wrap">
        <table className="ix-table">
          <thead>
            <tr>
              <th>Drug Pair</th>
              <th>Severity</th>
              <th>Recommendation</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const sev = (r.severity || '').toLowerCase() || null
              return (
                <tr key={i}>
                  <td className="ix-cell-pair">
                    <span className="ix-drug-a">{r.drugA ?? '—'}</span>
                    <span className="ix-pair-sep">×</span>
                    <span className="ix-drug-b">{r.drugB ?? '—'}</span>
                  </td>
                  <td className="ix-cell-severity">
                    <span className={`ix-severity-badge ix-severity-badge--${sev ?? 'unknown'}`}>
                      {r.severity ?? 'Unknown'}
                    </span>
                  </td>
                  <td className="ix-cell-interpretation">
                    {severityInterpretation(r.severity)}
                  </td>
                  <td className="ix-cell-description">
                    {r.description ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="ix-results-disclaimer">Always verify with a pharmacist before prescribing.</p>
    </div>
  )
}
