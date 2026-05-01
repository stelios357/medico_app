import { useState } from 'react'
import { get, set } from '../utils/storage'

const KEY = 'saved_items'

export function useSaved() {
  const [saved, setSaved] = useState(() => {
    const data = get(KEY)
    const arr = Array.isArray(data) ? data : []

    const seen = new Set()
    const normalized = []

    for (const item of arr) {
      if (!item || !item.id) continue

      let id
      try {
        id = encodeURIComponent(decodeURIComponent(item.id))
      } catch {
        id = encodeURIComponent(item.id)
      }

      if (!seen.has(id)) {
        seen.add(id)
        normalized.push({ ...item, id })
      }
    }

    return normalized.slice(0, 10)
  })

  function toggle(item) {
    setSaved(prev => {
      let canonicalId
      try {
        canonicalId = encodeURIComponent(decodeURIComponent(item.id))
      } catch {
        canonicalId = encodeURIComponent(item.id)
      }
      const exists = prev.some(s => s.id === canonicalId)
      const next = exists
        ? prev.filter(s => s.id !== canonicalId)
        : [{ id: canonicalId, name: item.name, type: item.type, route: item.route }, ...prev]
      set(KEY, next)
      return next
    })
  }

  function isItemSaved(id) {
    let canonicalId
    try {
      canonicalId = encodeURIComponent(decodeURIComponent(id))
    } catch {
      canonicalId = encodeURIComponent(id)
    }
    return saved.some(s => s.id === canonicalId)
  }

  return { saved, toggle, isItemSaved }
}
