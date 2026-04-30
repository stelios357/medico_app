import { MEDLINEPLUS_BASE, TTL_DISEASE } from '../utils/constants.js';
import { queryNormalize } from '../utils/queryNormalize.js';
import { cacheGet, cacheSet } from './cache.js';
import { fetchWithRetry } from './retry.js';
import { makeFallback } from './fallback.js';
import { dedupFetch } from './requestDedup.js';

function stripHtml(str) {
  if (!str) return null;
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim() || null;
}

function parseEntry(entry) {
  const title = stripHtml(entry.title?.['_value'] ?? entry.title ?? null);
  const summary = stripHtml(entry.summary?.['_value'] ?? entry.summary ?? null);
  const id = entry.id ?? null;
  const url = entry.link?.[0]?.href ?? null;

  // MedlinePlus doesn't provide structured sections — we expose what we have
  return { id, title, summary, url, specialty: null };
}

export const medlineplus = {
  async search(rawQuery, signal) {
    const query = queryNormalize(rawQuery);
    if (!query) return [];

    const cacheKey = `medlineplus:search:${query}`;
    const cached = cacheGet(cacheKey);
    if (cached !== null) return cached;

    const url =
      `${MEDLINEPLUS_BASE}?mainSearchCriteria.v.cs=2.16.840.1.113883.6.90` +
      `&mainSearchCriteria.v.dn=${encodeURIComponent(query)}` +
      `&knowledgeResponseType=application/json`;

    try {
      const data = await dedupFetch(cacheKey, () =>
        fetchWithRetry(url, { signal })
      );

      const feed = data?.feed;
      const entries = feed?.entry ?? [];
      const results = entries.map(parseEntry).filter(e => e.title);

      cacheSet(cacheKey, results, TTL_DISEASE);
      return results;
    } catch (err) {
      if (err?.name === 'AbortError') throw err;
      return makeFallback('medlineplus', err);
    }
  },

  async detail(id, signal) {
    if (!id) return makeFallback('medlineplus', new Error('No ID provided'));

    const cacheKey = `medlineplus:detail:${id}`;
    const cached = cacheGet(cacheKey);
    if (cached !== null) return cached;

    // MedlinePlus Connect does not have a dedicated detail endpoint by ID.
    // Re-search by the ID string (which is often the condition name or code).
    const url =
      `${MEDLINEPLUS_BASE}?mainSearchCriteria.v.cs=2.16.840.1.113883.6.90` +
      `&mainSearchCriteria.v.dn=${encodeURIComponent(id)}` +
      `&knowledgeResponseType=application/json`;

    try {
      const data = await dedupFetch(cacheKey, () =>
        fetchWithRetry(url, { signal })
      );

      const entries = data?.feed?.entry ?? [];
      const entry = entries[0];
      if (!entry) return makeFallback('medlineplus', new Error('No result found'));

      const result = parseEntry(entry);
      cacheSet(cacheKey, result, TTL_DISEASE);
      return result;
    } catch (err) {
      if (err?.name === 'AbortError') throw err;
      return makeFallback('medlineplus', err);
    }
  },
};
