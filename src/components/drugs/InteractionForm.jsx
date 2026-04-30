import { useState, useRef, useEffect } from 'react'
import { rxnorm } from '../../services/rxnorm.js'
import { isFallback } from '../../services/fallback.js'

export default function InteractionForm({ initialDrug, onResults, onLoading }) {
  const [chips, setChips] = useState([])
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isResolving, setIsResolving] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [resolveError, setResolveError] = useState(null)
  const debounceRef = useRef(null)
  const autocompleteAbortRef = useRef(null)
  const autocompleteSeqRef = useRef(0)
  const listRef = useRef(null)

  // Pre-populate with initialDrug (resolve its RxCUI on mount)
  useEffect(() => {
    if (!initialDrug) return
    let cancelled = false
    async function resolveInitial() {
      setIsResolving(true)
      const result = await rxnorm.resolveRxCUI(initialDrug)
      if (cancelled) return
      setIsResolving(false)
      if (!isFallback(result) && result) {
        setChips([{ name: initialDrug, rxcui: String(result) }])
      }
    }
    resolveInitial()
    return () => { cancelled = true }
  }, [initialDrug])

  // Debounced autocomplete
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setSuggestionsOpen(false)
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (autocompleteAbortRef.current) autocompleteAbortRef.current.abort()
      autocompleteAbortRef.current = new AbortController()
      const seq = ++autocompleteSeqRef.current
      const q = query
      const result = await rxnorm.autocomplete(q, autocompleteAbortRef.current.signal)
      if (seq !== autocompleteSeqRef.current) return
      if (!isFallback(result) && Array.isArray(result)) {
        setSuggestions(result.slice(0, 8))
        setSuggestionsOpen(result.length > 0)
        setHighlightedIndex(-1)
      }
    }, 300)
    return () => {
      clearTimeout(debounceRef.current)
      autocompleteAbortRef.current?.abort()
    }
  }, [query])

  async function selectSuggestion(name) {
    setSuggestionsOpen(false)
    setQuery('')
    setSuggestions([])
    setResolveError(null)
    if (chips.length >= 5) return
    setIsResolving(true)
    const rxcui = await rxnorm.resolveRxCUI(name)
    setIsResolving(false)
    if (isFallback(rxcui)) {
      setResolveError(`Could not resolve "${name}". Please try again.`)
      return
    }
    if (!rxcui) {
      setResolveError('Could not resolve drug')
      return
    }
    const newRxcui = String(rxcui)
    if (chips.some(d => String(d.rxcui) === newRxcui)) {
      return
    }
    setChips(prev => [...prev, { name, rxcui: newRxcui }])
  }

  function removeChip(index) {
    setChips(prev => prev.filter((_, i) => i !== index))
  }

  function handleKeyDown(e) {
    if (!suggestionsOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0) selectSuggestion(suggestions[highlightedIndex])
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  async function handleCheck() {
    if (chips.length < 2 || isChecking) return
    setIsChecking(true)
    onLoading?.(true)
    const rxcuis = chips.map(c => c.rxcui)
    const result = await rxnorm.getInteractions(rxcuis)
    setIsChecking(false)
    onLoading?.(false)
    onResults(result, chips)
  }

  const hintText = chips.length === 0
    ? 'Add 2–5 drugs to check for interactions.'
    : chips.length === 1
      ? 'Add at least one more drug.'
      : chips.length >= 5
        ? 'Maximum 5 drugs reached.'
        : `${chips.length} drugs added. Ready to check.`

  return (
    <div className="ix-form">
      {chips.length > 0 && (
        <div className="ix-chips" role="list" aria-label="Selected drugs">
          {chips.map((chip, i) => (
            <div key={`${chip.name}-${i}`} className="ix-chip" role="listitem">
              <span className="ix-chip-name">{chip.name}</span>
              <button
                type="button"
                className="ix-chip-remove"
                onClick={() => removeChip(i)}
                aria-label={`Remove ${chip.name}`}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {chips.length < 5 && (
        <div className="ix-input-wrap">
          <svg className="ix-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            className="ix-input"
            type="text"
            placeholder="Type a drug name and select from list…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
            onBlur={() => setTimeout(() => setSuggestionsOpen(false), 180)}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={suggestionsOpen}
            aria-controls="ix-suggestions-list"
            aria-activedescendant={highlightedIndex >= 0 ? `ix-suggestion-${highlightedIndex}` : undefined}
          />
          {suggestionsOpen && suggestions.length > 0 && (
            <ul
              id="ix-suggestions-list"
              ref={listRef}
              className="ix-suggestions"
              role="listbox"
            >
              {suggestions.map((s, i) => (
                <li
                  key={s}
                  id={`ix-suggestion-${i}`}
                  role="option"
                  aria-selected={i === highlightedIndex}
                  className={`ix-suggestion-item${i === highlightedIndex ? ' ix-suggestion-item--active' : ''}`}
                  onMouseDown={() => selectSuggestion(s)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {isResolving && (
        <p className="ix-resolving" aria-live="polite">Resolving drug identifier…</p>
      )}
      {resolveError && (
        <p className="ix-resolve-error" role="alert">{resolveError}</p>
      )}

      <p className="ix-hint">{hintText}</p>

      <button
        type="button"
        className="ix-submit"
        onClick={handleCheck}
        disabled={chips.length < 2 || isChecking}
        aria-busy={isChecking}
      >
        {isChecking
          ? <>
              <span className="ix-submit-spinner" aria-hidden="true" />
              Checking…
            </>
          : 'Check Interactions'
        }
      </button>
    </div>
  )
}
