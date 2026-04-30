import { Link } from 'react-router-dom'

export default function DiseaseCard({ disease, idx }) {
  const summary = disease.summary
    ? (disease.summary.length > 100 ? disease.summary.slice(0, 100) + '…' : disease.summary)
    : null

  return (
    <Link
      to={`/disease/${encodeURIComponent(String(disease.id != null ? disease.id : idx))}`}
      className="gs-result-item gs-result-disease"
    >
      <div className="gs-result-names">
        <span className="gs-result-primary">{disease.title || '—'}</span>
      </div>
      <div className="gs-result-badges">
        {disease._score === 3 && <span className="gs-badge gs-badge-exact">Exact match</span>}
        {disease.specialty && <span className="gs-badge gs-badge-specialty">{disease.specialty}</span>}
      </div>
      {summary && <p className="gs-result-summary">{summary}</p>}
    </Link>
  )
}
