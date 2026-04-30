import { useState, useEffect } from 'react'
import Nav from '../components/Nav.jsx'
import SearchBar from '../components/common/SearchBar.jsx'
import SearchResults from '../components/common/SearchResults.jsx'
import SearchRefinements from '../components/common/SearchRefinements.jsx'
import { useGlobalSearch } from '../hooks/useGlobalSearch'

export default function Home() {
  const {
    drugResults,
    diseaseResults,
    rawQuery,
    normalizedQuery,
    hasSearched,
    search,
    directHit,
    rateLimitWarning,
  } = useGlobalSearch()

  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState(null)

  // Reset active filter when the query changes
  useEffect(() => {
    setActiveFilter(null)
  }, [normalizedQuery])

  const drugList = Array.isArray(drugResults) ? drugResults : []
  const diseaseList = Array.isArray(diseaseResults) ? diseaseResults : []
  const hasDrugs = drugList.length > 0
  const hasDiseases = diseaseList.length > 0
  const bothLoaded = drugResults !== null && diseaseResults !== null

  function handleSuggestion(suggested) {
    setQuery(suggested)
    search(suggested)
  }

  return (
    <>
      <Nav />
      <main className="gs-home">
        <header className="gs-home-header">
          <h1 className="gs-home-title">Clinical Reference</h1>
          <p className="gs-home-subtitle">Search drugs, conditions, and interactions</p>
        </header>

        <div className="gs-search-wrap">
          <SearchBar
            value={query}
            onValueChange={setQuery}
            onSearch={search}
            directHit={directHit}
          />
          {rateLimitWarning && (
            <p className="gs-rate-warning">Data may be slightly delayed</p>
          )}
        </div>

        <SearchResults
          drugResults={drugResults}
          diseaseResults={diseaseResults}
          rawQuery={rawQuery}
          normalizedQuery={normalizedQuery}
          hasSearched={hasSearched}
          activeFilter={activeFilter}
          onSearch={handleSuggestion}
        />

        {bothLoaded && (hasDrugs || hasDiseases) && (
          <SearchRefinements
            hasDrugs={hasDrugs}
            hasDiseases={hasDiseases}
            activeFilter={activeFilter}
            onFilter={setActiveFilter}
          />
        )}
      </main>
    </>
  )
}
