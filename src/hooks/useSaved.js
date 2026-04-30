import { useState } from 'react'
import { get, set } from '../utils/storage'

const KEY = 'saved_items'

export function useSaved() {
  const [saved, setSaved] = useState(() => {
    const data = get(KEY)
    return Array.isArray(data) ? data : []
  })

  function toggle(item) {
    setSaved(prev => {
      const exists = prev.some(s => s.id === item.id)
      const next = exists
        ? prev.filter(s => s.id !== item.id)
        : [{ id: item.id, name: item.name, type: item.type, route: item.route }, ...prev]
      set(KEY, next)
      return next
    })
  }

  function isItemSaved(id) {
    return saved.some(s => s.id === id)
  }

  return { saved, toggle, isItemSaved }
}
