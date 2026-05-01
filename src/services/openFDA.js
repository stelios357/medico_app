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

function buildBrowseSearchQuery(drugClass, rxFilter) {
  const clauses = []
  const cls = (drugClass || '').trim()
  if (cls) {
    const safe = cls.replace(/"/g, '')
    clauses.push(`openfda.pharm_class_epc.exact:"${safe}"`)
  }
  if (rxFilter === 'rx') {
    clauses.push('openfda.product_type:"HUMAN PRESCRIPTION DRUG"')
  } else if (rxFilter === 'otc') {
    clauses.push('openfda.product_type:"HUMAN OTC DRUG"')
  }
  return clauses.join(' AND ')
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

    const url = `${OPENFDA_BASE}/drug/label.json?search=openfda.brand_name:${encodeURIComponent(query)}+openfda.generic_name:${encodeURIComponent(query)}&limit=10`;

    try {
      const data = await dedupFetch(cacheKey, () => {
        recordRequest();
        return fetchWithRetry(url, { signal });
      }, signal);

      const results = formatDrugList(data);
      cacheSet(cacheKey, results, TTL_DRUG);
      this.rateLimitWarning = false;
      return results;
    } catch (err) {
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
      }, signal);

      const result = formatDrug(data);
      if (!result) return makeFallback('openFDA', new Error('Empty response'));
      cacheSet(cacheKey, result, TTL_DRUG);
      return result;
    } catch (err) {
      return makeFallback('openFDA', err);
    }
  },

  /** Raw SPL record for interaction screening (first search hit). Not used for detail UX. */
  async firstMatchingLabelRecord(rawQuery, signal) {
    const query = queryNormalize(rawQuery);
    if (!query) return null;

    const cacheKey = `openfda:labelraw:${query}`;
    const cached = cacheGet(cacheKey);
    if (cached !== null) return cached;

    if (isApproachingRateLimit()) {
      this.rateLimitWarning = true;
      return null;
    }

    const url = `${OPENFDA_BASE}/drug/label.json?search=openfda.brand_name:${encodeURIComponent(query)}+openfda.generic_name:${encodeURIComponent(query)}&limit=3`;

    try {
      const data = await dedupFetch(cacheKey, () => {
        recordRequest();
        return fetchWithRetry(url, { signal });
      }, signal);

      if (data?.error || !data?.results?.length) {
        return null;
      }

      const rec = data.results[0];
      cacheSet(cacheKey, rec, TTL_DRUG);
      this.rateLimitWarning = false;
      return rec;
    } catch {
      return null;
    }
  },

  /**
   * Paginated label browse with optional pharm class + Rx/OTC filters (OpenFDA skip/limit).
   * @param {{ skip?: number, limit?: number, drugClass?: string, rxFilter?: 'all'|'rx'|'otc', signal?: AbortSignal }} opts
   */
  async browse(opts = {}) {
    const skip = Math.max(0, opts.skip ?? 0);
    const limit = Math.min(100, Math.max(1, opts.limit ?? 20));
    const drugClass = (opts.drugClass || '').trim();
    const rxFilter = opts.rxFilter || 'all';
    const { signal } = opts;

    const searchQ = buildBrowseSearchQuery(drugClass, rxFilter);
    const cacheKey = `openfda:browse:${skip}:${limit}:${drugClass}:${rxFilter}`;

    const cached = cacheGet(cacheKey);
    if (cached !== null) return cached;

    if (isApproachingRateLimit()) {
      this.rateLimitWarning = true;
      return makeFallback('openFDA', new Error('Rate limit'));
    }

    let url = `${OPENFDA_BASE}/drug/label.json?limit=${limit}&skip=${skip}`;
    if (searchQ) {
      url += `&search=${encodeURIComponent(searchQ)}`;
    }

    try {
      const data = await dedupFetch(cacheKey, () => {
        recordRequest();
        return fetchWithRetry(url, { signal });
      }, signal);

      if (data?.error) {
        return makeFallback('openFDA', new Error(data.error.message || 'Browse failed'));
      }

      const results = formatDrugList(data);
      const total = data?.meta?.results?.total != null ? Number(data.meta.results.total) : results.length;
      const payload = { results, total };
      cacheSet(cacheKey, payload, TTL_DRUG);
      this.rateLimitWarning = false;
      return payload;
    } catch (err) {
      if (signal?.aborted) return makeFallback('openFDA', err);
      // OpenFDA returns 404 when no labels match the filter combination.
      // Treat as empty results rather than a hard error.
      if (err?.message?.includes('HTTP 404')) {
        const empty = { results: [], total: 0 };
        cacheSet(cacheKey, empty, TTL_DRUG);
        return empty;
      }
      return makeFallback('openFDA', err);
    }
  },

  /** High-count pharm_class_epc terms for filter dropdowns. */
  async drugClassOptions(signal) {
    const cacheKey = 'openfda:facet:pharm_class_epc';
    const cached = cacheGet(cacheKey);
    if (cached !== null) return cached;

    if (isApproachingRateLimit()) {
      this.rateLimitWarning = true;
      return [];
    }

    const url = `${OPENFDA_BASE}/drug/label.json?count=openfda.pharm_class_epc.exact&limit=250`;

    try {
      const data = await dedupFetch(cacheKey, () => {
        recordRequest();
        return fetchWithRetry(url, { signal });
      }, signal);

      const terms = (data?.results ?? [])
        .map(r => r.term)
        .filter(t => typeof t === 'string' && t.trim().length > 0);
      cacheSet(cacheKey, terms, TTL_DRUG);
      this.rateLimitWarning = false;
      return terms;
    } catch {
      return [];
    }
  },
};
