export default function DiseaseHighlights({ disease }) {
  const title = disease.title || '—'
  const summaryRaw = disease.summary
  const summary =
    summaryRaw && summaryRaw.length > 150 ? summaryRaw.slice(0, 150) + '…' : summaryRaw

  return (
    <div className="dis-highlights">
      <h1 className="dis-heading">{title}</h1>
      {summary && <p className="dis-summary">{summary}</p>}
      {disease.specialty && (
        <span className="dis-badge dis-badge-specialty">{disease.specialty}</span>
      )}
    </div>
  )
}
