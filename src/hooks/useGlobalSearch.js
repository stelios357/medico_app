import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { openFDA } from '../services/openFDA'
import { medlineplus } from '../services/medlineplus'
import { queryNormalize } from '../utils/queryNormalize'
import { matchScore } from '../utils/matchScore'

function getResultName(result) {
  return result.brandName || result.genericName || result.title || ''
}

function scoreAndSort(results, normalizedQuery) {
  if (!Array.isArray(results)) return []
  return results
    .map(r => ({ ...r, _score: matchScore(normalizedQuery, getResultName(r)) }))
    .sort((a, b) => b._score - a._score)
}

export function useGlobalSearch() {
  // null = loading, [] = empty/error, array = results with _score attached
  const [drugResults, setDrugResults] = useState([])
  const [diseaseResults, setDiseaseResults] = useState([])
  const [rawQuery, setRawQuery] = useState('')
  const [normalizedQuery, setNormalizedQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  // queryId protects against logical query changes (older slow response
  // arriving after a newer query has already been fired)
  const queryIdRef = useRef(0)

  // AbortController cancels in-flight fetch on query change
  const abortRef = useRef(null)

  // Cancel any in-flight requests on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  const search = useCallback((raw) => {
    const norm = queryNormalize(raw)

    setRawQuery(raw)
    setNormalizedQuery(norm || '')

    // Below minimum length — clear results, no API call
    if (!norm || norm.length < 2) {
      setDrugResults([])
      setDiseaseResults([])
      setHasSearched(false)
      if (abortRef.current) abortRef.current.abort()
      return
    }

    setHasSearched(true)
    const currentId = ++queryIdRef.current

    // null signals loading state to each result group independently
    setDrugResults(null)
    setDiseaseResults(null)

    // Abort the previous query's requests
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const { signal } = controller

    // ── Drug search — independent, does NOT block disease rendering ──
    ;(async () => {
      try {
        let results = await openFDA.search(raw, signal)

        // queryId check: logical query changed — discard stale response
        if (queryIdRef.current !== currentId) return

        // Retry with normalized query if poor results and raw differs from norm
        if (!results?.error && Array.isArray(results) && results.length < 2 && raw !== norm) {
          const retried = await openFDA.search(norm, signal)
          if (queryIdRef.current !== currentId) return
          if (!retried?.error) results = retried
        }

        setDrugResults(scoreAndSort(results?.error ? [] : results, norm))
      } catch (err) {
        if (err?.name === 'AbortError') return
        if (queryIdRef.current !== currentId) return
        setDrugResults([])
      }
    })()

    // ── Disease search — independent, renders when ready ──
    ;(async () => {
      try {
        let results = await medlineplus.search(raw, signal)

        // queryId check
        if (queryIdRef.current !== currentId) return

        // Retry with normalized query if poor results
        if (!results?.error && Array.isArray(results) && results.length < 2 && raw !== norm) {
          const retried = await medlineplus.search(norm, signal)
          if (queryIdRef.current !== currentId) return
          if (!retried?.error) results = retried
        }

        setDiseaseResults(scoreAndSort(results?.error ? [] : results, norm))
      } catch (err) {
        if (err?.name === 'AbortError') return
        if (queryIdRef.current !== currentId) return
        setDiseaseResults([])
      }
    })()
  }, [])

  // Direct hit: exactly one score-3 result across all groups (drugs first)
  const directHit = useMemo(() => {
    if (!normalizedQuery || drugResults === null || diseaseResults === null) return null

    const exactDrugs = (drugResults || []).filter(r => r._score === 3)
    const exactDiseases = (diseaseResults || []).filter(r => r._score === 3)

    if (exactDrugs.length === 1 && exactDiseases.length === 0) {
      return { type: 'drug', id: exactDrugs[0].id }
    }
    if (exactDiseases.length === 1 && exactDrugs.length === 0) {
      return { type: 'disease', id: exactDiseases[0].id }
    }
    return null
  }, [normalizedQuery, drugResults, diseaseResults])

  return {
    drugResults,
    diseaseResults,
    rawQuery,
    normalizedQuery,
    hasSearched,
    search,
    directHit,
    rateLimitWarning: openFDA.rateLimitWarning,
  }
}
