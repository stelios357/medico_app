import { RXNORM_BASE, TTL_DRUG } from '../utils/constants.js';
import { cacheGet, cacheSet } from './cache.js';
import { fetchWithRetry } from './retry.js';
import { makeFallback } from './fallback.js';
import { dedupFetch } from './requestDedup.js';

export const rxnorm = {
  async autocomplete(rawQuery, signal) {
    const query = rawQuery?.trim();
    if (!query || query.length < 2) return [];

    const cacheKey = `rxnorm:autocomplete:${query.toLowerCase()}`;
    const cached = cacheGet(cacheKey);
    if (cached !== null) return cached;

    const url = `${RXNORM_BASE}/spellingsuggestions.json?name=${encodeURIComponent(query)}`;

    try {
      const data = await dedupFetch(cacheKey, () =>
        fetchWithRetry(url, { signal })
      , signal);

      if (typeof data === 'string' && data.includes('Not found')) {
        return [];
      }

      const suggestions = data?.suggestionGroup?.suggestionList?.suggestion ?? [];
      cacheSet(cacheKey, suggestions, TTL_DRUG);
      return suggestions;
    } catch (err) {
      return makeFallback('rxnorm', err);
    }
  },

  async resolveRxCUI(drugName, signal) {
    const name = drugName?.trim();
    if (!name) return makeFallback('rxnorm', new Error('No drug name provided'));

    const cacheKey = `rxnorm:rxcui:${name.toLowerCase()}`;
    const cached = cacheGet(cacheKey);
    if (cached !== null) return cached;

    const url = `${RXNORM_BASE}/rxcui.json?name=${encodeURIComponent(name)}&search=1`;

    try {
      const data = await dedupFetch(cacheKey, () =>
        fetchWithRetry(url, { signal })
      , signal);

      if (typeof data === 'string' && data.includes('Not found')) {
        return makeFallback('rxnorm', new Error(`No RxCUI found for "${name}"`));
      }

      const rxcui = data?.idGroup?.rxnormId?.[0] ?? null;
      if (!rxcui) {
        return makeFallback('rxnorm', new Error(`No RxCUI found for "${name}"`));
      }
      cacheSet(cacheKey, rxcui, TTL_DRUG);
      return rxcui;
    } catch (err) {
      return makeFallback('rxnorm', err);
    }
  },

};
