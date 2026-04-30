import { Link } from 'react-router-dom'
import SearchSkeleton from './SearchSkeleton'

function DrugItem({ drug }) {
  const primary = drug.brandName || drug.genericName || '—'
  const secondary = drug.brandName && drug.genericName ? drug.genericName : null

  return (
    <Link to={`/drug/${drug.id}`} className="gs-result-item gs-result-drug">
      <div className="gs-result-names">
        <span className="gs-result-primary">{primary}</span>
        {secondary && <span className="gs-result-secondary">{secondary}</span>}
      </div>
      <div className="gs-result-badges">
        {drug._score === 3 && <span className="gs-badge gs-badge-exact">Exact match</span>}
        {drug.hasBlackBoxWarning && <span className="gs-badge gs-badge-blackbox">⚠ Black Box</span>}
        <span className={`gs-badge ${drug.isRx ? 'gs-badge-rx' : 'gs-badge-otc'}`}>
          {drug.isRx ? 'Rx' : 'OTC'}
        </span>
        {drug.drugClass && <span className="gs-badge gs-badge-class">{drug.drugClass}</span>}
      </div>
      {drug.indicationShort && (
        <p className="gs-result-indication">{drug.indicationShort}</p>
      )}
    </Link>
  )
}

function DiseaseItem({ disease, idx }) {
  const summary = disease.summary
    ? (disease.summary.length > 100 ? disease.summary.slice(0, 100) + '…' : disease.summary)
    : null

  return (
    <Link to={`/disease/${disease.id || idx}`} className="gs-result-item gs-result-disease">
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

export default function SearchResults({
  drugResults,
  diseaseResults,
  rawQuery,
  normalizedQuery,
  hasSearched,
  activeFilter,
  onSearch,
}) {
  if (!hasSearched) return null

  const drugList = Array.isArray(drugResults) ? drugResults : []
  const diseaseList = Array.isArray(diseaseResults) ? diseaseResults : []
  const hasDrugs = drugList.length > 0
  const hasDiseases = diseaseList.length > 0
  const bothLoaded = drugResults !== null && diseaseResults !== null
  const noResults = bothLoaded && !hasDrugs && !hasDiseases

  const showDrugs = activeFilter !== 'diseases'
  const showDiseases = activeFilter !== 'drugs'

  if (noResults) {
    const showSuggestion =
      normalizedQuery && normalizedQuery !== rawQuery.toLowerCase().trim()
    return (
      <div className="gs-results">
        <div className="gs-no-results">
          <p>No results for <strong>"{rawQuery}"</strong></p>
          {showSuggestion && (
            <p className="gs-no-results-tip">
              Try:{' '}
              <button className="gs-suggestion-btn" onClick={() => onSearch?.(normalizedQuery)}>
                "{normalizedQuery}"
              </button>
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="gs-results">
      {/* Drug group — always renders first */}
      {showDrugs && (
        <section className="gs-group" aria-label="Medications">
          <h2 className="gs-group-heading">Medications</h2>
          {drugResults === null ? (
            <SearchSkeleton />
          ) : hasDrugs ? (
            <div className="gs-group-items">
              {drugList.map(drug => <DrugItem key={drug.id} drug={drug} />)}
            </div>
          ) : null}
        </section>
      )}

      {/* Disease group — independent, renders when ready */}
      {showDiseases && (
        <section className="gs-group" aria-label="Conditions">
          <h2 className="gs-group-heading">Conditions</h2>
          {diseaseResults === null ? (
            <SearchSkeleton />
          ) : hasDiseases ? (
            <div className="gs-group-items">
              {diseaseList.map((disease, i) => (
                <DiseaseItem key={disease.id || i} disease={disease} idx={i} />
              ))}
            </div>
          ) : null}
        </section>
      )}
    </div>
  )
}
