import { useState } from 'react'
import { get, set } from '../utils/storage'

const KEY = 'recently_viewed'
const MAX = 10

export function useRecentlyViewed() {
  const [items, setItems] = useState(() => {
    const data = get(KEY)
    return Array.isArray(data) ? data : []
  })

  function add({ name, route, type }) {
    setItems(prev => {
      const filtered = prev.filter(i => i.route !== route)
      const next = [{ name, route, type, timestamp: Date.now() }, ...filtered].slice(0, MAX)
      set(KEY, next)
      return next
    })
  }

  return { items, add }
}
