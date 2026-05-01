import { Link } from 'react-router-dom'
import SearchSkeleton from './SearchSkeleton'
import DrugCard from '../drugs/DrugCard.jsx'
import DiseaseCard from '../diseases/DiseaseCard.jsx'

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
          <div className="gs-group-heading-row">
            <h2 className="gs-group-heading gs-group-heading--inline">Medications</h2>
            <Link to="/drugs" className="gs-browse-all">Browse all</Link>
          </div>
          {drugResults === null ? (
            <SearchSkeleton />
          ) : hasDrugs ? (
            <div className="gs-group-items">
              {drugList.map(drug => <DrugCard key={drug.id} drug={drug} />)}
            </div>
          ) : null}
        </section>
      )}

      {/* Disease group — independent, renders when ready */}
      {showDiseases && (
        <section className="gs-group" aria-label="Conditions">
          <div className="gs-group-heading-row">
            <h2 className="gs-group-heading gs-group-heading--inline">Conditions</h2>
            <Link to="/diseases" className="gs-browse-all">Browse all</Link>
          </div>
          {diseaseResults === null ? (
            <SearchSkeleton />
          ) : hasDiseases ? (
            <div className="gs-group-items">
              {diseaseList.map((disease, i) => (
                <DiseaseCard key={disease.id != null ? disease.id : i} disease={disease} idx={i} />
              ))}
            </div>
          ) : null}
        </section>
      )}
    </div>
  )
}
