/**
 * Scores a query against a candidate name.
 * Returns:
 *   3 — exact match
 *   2 — name starts with query
 *   1 — name contains query, or token overlap
 *   0 — no match
 */
export function matchScore(query, name) {
  if (!query || !name) return 0
  const q = query.toLowerCase().trim()
  const n = name.toLowerCase().trim()
  if (!q || !n) return 0

  if (q === n) return 3
  if (n.startsWith(q)) return 2
  if (n.includes(q)) return 1

  // Token overlap: any query word matches any name word (substring)
  const qTokens = q.split(/\s+/).filter(Boolean)
  const nTokens = n.split(/\s+/).filter(Boolean)
  const hasOverlap = qTokens.some(qt =>
    nTokens.some(nt => nt.includes(qt) || qt.includes(nt))
  )
  return hasOverlap ? 1 : 0
}

/**
 * Drug-aware scoring so a query like "metformin" counts as exact against
 * "METFORMIN HYDROCHLORIDE" / brand+generic combinations (Session 7).
 */
export function matchDrugScore(query, drug) {
  if (!query || !drug) return 0
  const norm = query.toLowerCase().trim()
  if (!norm) return 0

  const names = [drug.brandName, drug.genericName].filter(Boolean).map(s => s.toLowerCase().trim())
  for (const n of names) {
    if (n === norm) return 3
    const first = n.split(/[\s,/]+/)[0]
    if (first === norm) return 3
  }

  const primary = drug.brandName || drug.genericName || ''
  return matchScore(norm, primary)
}
