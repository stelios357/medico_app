import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import SearchBar from '../components/common/SearchBar.jsx'
import SearchResults from '../components/common/SearchResults.jsx'
import SearchRefinements from '../components/common/SearchRefinements.jsx'
import RecentSearches from '../components/common/RecentSearches.jsx'
import RecentlyViewed from '../components/common/RecentlyViewed.jsx'
import SavedItems from '../components/common/SavedItems.jsx'
import { useGlobalSearch } from '../hooks/useGlobalSearch'
import { useRecentSearches } from '../hooks/useRecentSearches'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { useSaved } from '../hooks/useSaved'

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
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

  const recentSearches = useRecentSearches()
  const recentlyViewed = useRecentlyViewed()
  const savedHook = useSaved()

  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState(null)

  useEffect(() => {
    setActiveFilter(null)
  }, [normalizedQuery])

  const handleSearch = useCallback((raw) => {
    search(raw)
    if (raw && raw.trim().length >= 2) {
      recentSearches.add(raw.trim())
    }
  }, [search, recentSearches])

  useEffect(() => {
    const q = location.state?.relatedDrugSearch
    if (typeof q !== 'string' || q.trim().length < 2) return
    const trimmed = q.trim()
    setQuery(trimmed)
    handleSearch(trimmed)
    navigate('.', { replace: true, state: {} })
  }, [location.state?.relatedDrugSearch, handleSearch, navigate])

  const drugList = Array.isArray(drugResults) ? drugResults : []
  const diseaseList = Array.isArray(diseaseResults) ? diseaseResults : []
  const hasDrugs = drugList.length > 0
  const hasDiseases = diseaseList.length > 0
  const bothLoaded = drugResults !== null && diseaseResults !== null

  const showHabitLoop = !hasSearched

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
            onSearch={handleSearch}
            directHit={directHit}
          />
          {rateLimitWarning && (
            <p className="gs-rate-warning">Data may be slightly delayed</p>
          )}
        </div>

        {showHabitLoop && (
          <div className="hl-section">
            <RecentSearches
              searches={recentSearches.searches}
              onSearch={(q) => {
                setQuery(q)
                handleSearch(q)
              }}
            />
            <RecentlyViewed items={recentlyViewed.items} />
            <SavedItems saved={savedHook.saved} />
          </div>
        )}

        <SearchResults
          drugResults={drugResults}
          diseaseResults={diseaseResults}
          rawQuery={rawQuery}
          normalizedQuery={normalizedQuery}
          hasSearched={hasSearched}
          activeFilter={activeFilter}
          onSearch={handleSearch}
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
