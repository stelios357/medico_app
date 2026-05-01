import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar({ value, onValueChange, onSearch, directHit }) {
  const debounceRef = useRef(null)
  const navigate = useNavigate()

  const handleChange = useCallback((e) => {
    const val = e.target.value
    onValueChange?.(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearch(val)
    }, 400)
  }, [onValueChange, onSearch])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && directHit) {
      const route = directHit.type === 'drug'
        ? `/drug/${directHit.id}`
        : `/disease/${encodeURIComponent(String(directHit.id ?? ''))}`
      navigate(route)
    }
  }, [directHit, navigate])

  return (
    <div className="gs-searchbar">
      <svg className="gs-searchbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        className="gs-input"
        placeholder="Search drugs, conditions…"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label="Search drugs and conditions"
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  )
}
