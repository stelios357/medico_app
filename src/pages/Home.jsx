import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import SearchBar from '../components/common/SearchBar.jsx'
import SearchResults from '../components/common/SearchResults.jsx'
import SearchRefinements from '../components/common/SearchRefinements.jsx'
import RecentSearches from '../components/common/RecentSearches.jsx'
import RecentlyViewed from '../components/common/RecentlyViewed.jsx'
import SavedItems from '../components/common/SavedItems.jsx'
import CalcStrip from '../components/common/CalcStrip.jsx'
import { useGlobalSearch } from '../hooks/useGlobalSearch'
import { useRecentSearches } from '../hooks/useRecentSearches'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { useSaved } from '../hooks/useSaved'
import { calculatorRegistry } from '../data/calculatorRegistry.js'

function EcgBg() {
  return (
    <svg
      className="ecg-bg"
      viewBox="0 0 1440 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path
        className="ecg-line"
        d="M0,100 L160,100 L172,88 L182,100 L190,44 L198,156 L206,100 L220,100 L230,112 L240,100 L560,100 L572,88 L582,100 L590,44 L598,156 L606,100 L620,100 L630,112 L640,100 L960,100 L972,88 L982,100 L990,44 L998,156 L1006,100 L1020,100 L1030,112 L1040,100 L1440,100"
      />
    </svg>
  );
}

const FEATURES = [
  {
    to: '/drugs',
    title: 'Medications',
    stat: '50,000+ drugs',
    accentClass: 'hm-feat--drug',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.5 9.5a7 7 0 1 0 14 0"/>
        <path d="M4.5 9.5a7 7 0 0 1 14 0"/>
        <line x1="12" y1="2.5" x2="12" y2="16.5"/>
        <path d="M7 6h10M7 9h10"/>
        <ellipse cx="12" cy="9.5" rx="7" ry="4"/>
      </svg>
    ),
  },
  {
    to: '/diseases',
    title: 'Conditions',
    stat: 'MedlinePlus',
    accentClass: 'hm-feat--disease',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    to: '/interactions',
    title: 'Interactions',
    stat: 'Drug pairs',
    accentClass: 'hm-feat--interaction',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    to: '/calculators',
    title: 'Calculators',
    stat: `${calculatorRegistry.length} tools`,
    accentClass: 'hm-feat--calc',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <line x1="8" y1="6" x2="16" y2="6"/>
        <line x1="8" y1="10" x2="12" y2="10"/>
        <line x1="8" y1="14" x2="12" y2="14"/>
        <line x1="8" y1="18" x2="12" y2="18"/>
        <line x1="15" y1="10" x2="16" y2="10"/>
        <line x1="15" y1="14" x2="16" y2="14"/>
        <line x1="15" y1="18" x2="16" y2="18"/>
      </svg>
    ),
  },
];

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
    const base = trimmed.split('(')[0].trim()
    const cleanQuery = base || trimmed
    setQuery(cleanQuery)
    handleSearch(cleanQuery)
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

        {/* ── Hero ── */}
        <section className="hm-hero">
          <EcgBg />
          <div className="hm-hero-inner">
            <div className="hero-badge">
              <span className="badge-dot" aria-hidden="true" />
              Clinical Reference · For Residents
            </div>
            <h1 className="hm-hero-title">
              medico<span className="hm-hero-accent">.</span>
            </h1>
            <p className="hm-hero-tagline">Search. Calculate. Reference.</p>

            <div className="gs-search-wrap hm-search-wrap">
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
          </div>
        </section>

        {/* ── Feature cards ── */}
        {!hasSearched && (
          <section className="hm-features" aria-label="App features">
            {FEATURES.map((feat) => (
              <Link
                key={feat.to}
                to={feat.to}
                className={`hm-feat ${feat.accentClass}`}
                aria-label={feat.title}
              >
                <div className="hm-feat-icon">{feat.icon}</div>
                <span className="hm-feat-title">{feat.title}</span>
                <span className="hm-feat-stat">{feat.stat}</span>
              </Link>
            ))}
          </section>
        )}

        {/* ── Pinned calculators ── */}
        <CalcStrip />

        {/* ── Habit loop ── */}
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

        {/* ── Search results ── */}
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
