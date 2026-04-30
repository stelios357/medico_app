import { useState } from 'react'
import { get, set } from '../utils/storage'
import { queryNormalize } from '../utils/queryNormalize'

const KEY = 'recent_searches'
const MAX = 10

export function useRecentSearches() {
  const [items, setItems] = useState(() => {
    const data = get(KEY)
    if (!Array.isArray(data)) return []
    // drop legacy string entries from before normalization was added
    return data.filter(i => i && typeof i === 'object' && i.key && i.label)
  })

  function add(query) {
    const key = queryNormalize(query)
    if (!key || key.length < 2) return
    const label = (query || '').trim()
    if (!label) return
    setItems(prev => {
      const filtered = prev.filter(i => i.key !== key)
      const next = [{ key, label }, ...filtered].slice(0, MAX)
      set(KEY, next)
      return next
    })
  }

  return { searches: items, add }
}
