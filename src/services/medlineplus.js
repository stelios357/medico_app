import { MEDLINEPLUS_BASE, TTL_DISEASE } from '../utils/constants.js';
import { queryNormalize } from '../utils/queryNormalize.js';
import { stripHtml } from '../utils/stripHtml.js';
import { cacheGet, cacheSet } from './cache.js';
import { fetchWithRetry } from './retry.js';
import { makeFallback } from './fallback.js';
import { dedupFetch } from './requestDedup.js';

function parseEntry(entry) {
  const title = stripHtml(entry.title?.['_value'] ?? entry.title ?? null);
  const summary = stripHtml(entry.summary?.['_value'] ?? entry.summary ?? null);
  const id = entry.id ?? null;
  const url = entry.link?.[0]?.href ?? null;

  // MedlinePlus Connect entries are usually title + summary only; structured sections are null until sourced.
  return {
    id,
    title,
    summary,
    url,
    specialty: null,
    causes: null,
    symptoms: null,
    diagnosis: null,
    treatment: null,
    whenToSeeDoctor: null,
  };
}

/** Topic hints per specialty for browse (merged client-side; API has no native browse). */
const BROWSE_QUERIES_BY_SPECIALTY = {
  all: ['hypertension', 'diabetes', 'asthma', 'arthritis', 'migraine', 'pneumonia', 'depression', 'hepatitis'],
  cardiology: ['hypertension', 'heart attack', 'atrial fibrillation', 'heart failure', 'angina'],
  endocrinology: ['diabetes', 'thyroid', 'osteoporosis', 'hyperthyroidism'],
  neurology: ['migraine', 'epilepsy', 'stroke', 'parkinson', 'multiple sclerosis'],
  pulmonology: ['asthma', 'copd', 'pneumonia', 'bronchitis'],
  gastroenterology: ['gerd', 'hepatitis', 'crohn', 'colitis', 'irritable bowel'],
  psychiatry: ['depression', 'anxiety', 'bipolar', 'schizophrenia'],
  nephrology: ['kidney disease', 'kidney stones', 'chronic kidney'],
  rheumatology: ['arthritis', 'lupus', 'fibromyalgia', 'gout'],
};

const SPECIALTY_LABELS = {
  all: null,
  cardiology: 'Cardiology',
  endocrinology: 'Endocrinology',
  neurology: 'Neurology',
  pulmonology: 'Pulmonology',
  gastroenterology: 'Gastroenterology',
  psychiatry: 'Psychiatry',
  nephrology: 'Nephrology',
  rheumatology: 'Rheumatology',
};

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
      , signal);

      const feed = data?.feed;
      const entries = feed?.entry ?? [];
      const results = entries.map(parseEntry).filter(e => e.title);

      cacheSet(cacheKey, results, TTL_DISEASE);
      return results;
    } catch (err) {
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
      , signal);

      const entries = data?.feed?.entry ?? [];
      const entry = entries[0];
      if (!entry) return makeFallback('medlineplus', new Error('No result found'));

      const result = parseEntry(entry);
      cacheSet(cacheKey, result, TTL_DISEASE);
      return result;
    } catch (err) {
      return makeFallback('medlineplus', err);
    }
  },

  /**
   * Merge several Connect searches (no native browse API).
   * @param {{ specialty?: string, signal?: AbortSignal }} opts
   */
  async browse(opts = {}) {
    const key = opts.specialty && BROWSE_QUERIES_BY_SPECIALTY[opts.specialty]
      ? opts.specialty
      : 'all';
    const { signal } = opts;
    const queries = BROWSE_QUERIES_BY_SPECIALTY[key];
    const label = SPECIALTY_LABELS[key];

    const merged = new Map();
    for (const q of queries) {
      const rows = await this.search(q, signal);
      if (signal?.aborted) break;
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        const mapKey = row.id != null ? String(row.id) : row.title;
        if (!mapKey || merged.has(mapKey)) continue;
        merged.set(mapKey, label ? { ...row, specialty: label } : row);
      }
    }

    const list = Array.from(merged.values());
    list.sort((a, b) =>
      (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }),
    );
    return list;
  },
};

export const DISEASE_BROWSE_OPTIONS = [
  { value: 'all', label: 'All specialties' },
  ...Object.entries(SPECIALTY_LABELS)
    .filter(([k]) => k !== 'all')
    .map(([value, lbl]) => ({ value, label: lbl })),
];
