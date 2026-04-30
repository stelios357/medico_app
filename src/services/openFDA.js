import { OPENFDA_BASE, TTL_DRUG, RATE_LIMIT_WARN_THRESHOLD } from '../utils/constants.js';
import { queryNormalize } from '../utils/queryNormalize.js';
import { formatDrug, formatDrugList } from '../utils/formatDrug.js';
import { cacheGet, cacheSet } from './cache.js';
import { fetchWithRetry } from './retry.js';
import { makeFallback } from './fallback.js';
import { dedupFetch } from './requestDedup.js';

// Rate limiting tracker
const requestTimestamps = [];

function isApproachingRateLimit() {
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;
  // Prune old timestamps
  while (requestTimestamps.length && requestTimestamps[0] < oneMinuteAgo) {
    requestTimestamps.shift();
  }
  return requestTimestamps.length >= RATE_LIMIT_WARN_THRESHOLD;
}

function recordRequest() {
  requestTimestamps.push(Date.now());
}

export const openFDA = {
  rateLimitWarning: false,

  async search(rawQuery, signal) {
    const query = queryNormalize(rawQuery);
    if (!query) return [];

    const cacheKey = `openfda:search:${query}`;
    const cached = cacheGet(cacheKey);
    if (cached !== null) return cached;

    // Cache miss — check rate limit before committing to a network call
    if (isApproachingRateLimit()) {
      this.rateLimitWarning = true;
      // Nothing to serve — return empty rather than a hard error
      return [];
    }

    const url = `${OPENFDA_BASE}/drug/label.json?search=brand_name:${encodeURIComponent(query)}+generic_name:${encodeURIComponent(query)}&limit=10`;

    try {
      const data = await dedupFetch(cacheKey, () => {
        recordRequest();
        return fetchWithRetry(url, { signal });
      });

      const results = formatDrugList(data);
      cacheSet(cacheKey, results, TTL_DRUG);
      this.rateLimitWarning = false;
      return results;
    } catch (err) {
      if (err?.name === 'AbortError') throw err;
      return makeFallback('openFDA', err);
    }
  },

  async detail(id, signal) {
    if (!id) return makeFallback('openFDA', new Error('No ID provided'));

    const cacheKey = `openfda:detail:${id}`;
    const cached = cacheGet(cacheKey);
    if (cached !== null) return cached;

    const url = `${OPENFDA_BASE}/drug/label.json?search=id:${encodeURIComponent(id)}&limit=1`;

    try {
      const data = await dedupFetch(cacheKey, () => {
        recordRequest();
        return fetchWithRetry(url, { signal });
      });

      const result = formatDrug(data);
      if (!result) return makeFallback('openFDA', new Error('Empty response'));
      cacheSet(cacheKey, result, TTL_DRUG);
      return result;
    } catch (err) {
      if (err?.name === 'AbortError') throw err;
      return makeFallback('openFDA', err);
    }
  },
};
