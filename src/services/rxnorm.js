import { RXNORM_BASE, TTL_DRUG, TTL_INTERACTION } from '../utils/constants.js';
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
      );

      const suggestions = data?.suggestionGroup?.suggestionList?.suggestion ?? [];
      cacheSet(cacheKey, suggestions, TTL_DRUG);
      return suggestions;
    } catch (err) {
      if (err?.name === 'AbortError') throw err;
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
      );

      const rxcui = data?.idGroup?.rxnormId?.[0] ?? null;
      if (!rxcui) {
        return makeFallback('rxnorm', new Error(`No RxCUI found for "${name}"`));
      }
      cacheSet(cacheKey, rxcui, TTL_DRUG);
      return rxcui;
    } catch (err) {
      if (err?.name === 'AbortError') throw err;
      return makeFallback('rxnorm', err);
    }
  },

  async getInteractions(rxcuis, signal) {
    if (!Array.isArray(rxcuis) || rxcuis.length < 2) {
      return makeFallback('rxnorm', new Error('At least 2 RxCUI IDs required'));
    }
    // Guard: RxCUI values must be numeric strings — catch accidental drug name passthrough
    const allNumeric = rxcuis.every(id => typeof id === 'string' && /^\d+$/.test(id));
    if (!allNumeric) {
      return makeFallback('rxnorm', new Error('RxCUI IDs must be numeric strings — resolve names first via resolveRxCUI()'));
    }

    const key = rxcuis.slice().sort().join(',');
    const cacheKey = `rxnorm:interactions:${key}`;
    const cached = cacheGet(cacheKey);
    if (cached !== null) return cached;

    const url = `${RXNORM_BASE}/interaction/list.json?rxcuis=${rxcuis.join(',')}`;

    try {
      const data = await dedupFetch(cacheKey, () =>
        fetchWithRetry(url, { signal })
      );

      const pairs = data?.fullInteractionTypeGroup ?? [];
      const interactions = [];

      for (const group of pairs) {
        for (const typeEntry of group.fullInteractionType ?? []) {
          for (const pair of typeEntry.interactionPair ?? []) {
            const drugA = pair.interactionConcept?.[0]?.minConceptItem?.name ?? null;
            const drugB = pair.interactionConcept?.[1]?.minConceptItem?.name ?? null;
            const severity = pair.severity?.toLowerCase() ?? null;
            const description = pair.description ?? null;

            interactions.push({ drugA, drugB, severity, description });
          }
        }
      }

      cacheSet(cacheKey, interactions, TTL_INTERACTION);
      return interactions;
    } catch (err) {
      if (err?.name === 'AbortError') throw err;
      return makeFallback('rxnorm', err);
    }
  },
};
