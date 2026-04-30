function truncateSummary(text, limit = 150) {
  if (!text) return null
  if (text.length <= limit) return text
  return text.slice(0, limit).replace(/\s+\S*$/, '')
}

export default function DiseaseHighlights({ disease }) {
  const title = disease.title || '—'
  const summaryRaw = disease.summary
  const summary = truncateSummary(summaryRaw, 150)

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
