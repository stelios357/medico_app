import { MEDLINEPLUS_WSEARCH, TTL_DISEASE } from '../utils/constants.js';
import { queryNormalize } from '../utils/queryNormalize.js';
import { stripHtml } from '../utils/stripHtml.js';
import { cacheGet, cacheSet } from './cache.js';
import { fetchWithRetry } from './retry.js';
import { makeFallback, isFallback } from './fallback.js';
import { dedupFetch } from './requestDedup.js';

function topicFilenameFromPageUrl(pageUrl) {
  if (!pageUrl) return null;
  try {
    const path = new URL(pageUrl).pathname;
    const file = path.split('/').filter(Boolean).pop();
    return file || null;
  } catch {
    return null;
  }
}

/** Resolve stable topic page filename from route param or legacy Connect atom id. */
function topicFilenameFromId(rawId) {
  const id = String(rawId || '').trim();
  if (!id) return null;

  const tagMatch = id.match(/:\s*\/([^?\s]+\.html)/i);
  if (tagMatch) return tagMatch[1].toLowerCase();

  if (/^https?:\/\//i.test(id)) {
    const fn = topicFilenameFromPageUrl(id);
    return fn ? fn.toLowerCase() : null;
  }

  const plain = id.split('?')[0].split('#')[0];
  const last = plain.split('/').pop() || plain;
  if (/\.html$/i.test(last)) return last.toLowerCase();

  return null;
}

function wsearchTermFromId(rawId) {
  const file = topicFilenameFromId(rawId);
  if (file) {
    return file.replace(/\.html$/i, '').replace(/-/g, ' ');
  }
  return decodeURIComponent(String(rawId || '').trim());
}

function urlMatchesTopicFilename(pageUrl, filenameLower) {
  if (!pageUrl || !filenameLower) return false;
  const fn = topicFilenameFromPageUrl(pageUrl);
  return fn != null && fn.toLowerCase() === filenameLower;
}

function parseHealthTopicsBriefXml(xmlText) {
  if (!xmlText || typeof xmlText !== 'string') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  if (doc.querySelector('parsererror')) return [];

  const out = [];
  for (const el of doc.querySelectorAll('document')) {
    const pageUrl = el.getAttribute('url');
    if (!pageUrl) continue;

    let titleRaw = '';
    let snippetRaw = '';
    for (const c of el.querySelectorAll('content')) {
      const name = c.getAttribute('name');
      if (name === 'title') titleRaw = c.textContent ?? '';
      else if (name === 'snippet') snippetRaw = c.textContent ?? '';
    }

    const title = stripHtml(titleRaw);
    if (!title) continue;

    const id = topicFilenameFromPageUrl(pageUrl) ?? pageUrl;
    out.push({
      id,
      title,
      summary: stripHtml(snippetRaw),
      url: pageUrl,
      specialty: null,
      causes: null,
      symptoms: null,
      diagnosis: null,
      treatment: null,
      whenToSeeDoctor: null,
    });
  }
  return out;
}

function parseHealthTopicDocument(documentEl) {
  const topicContent = [...documentEl.querySelectorAll('content')].find(
    c => c.getAttribute('name') === 'healthTopic',
  );
  const ht = topicContent?.querySelector('health-topic');
  if (!ht) return null;

  const pageUrl = ht.getAttribute('url') || documentEl.getAttribute('url');
  const title = stripHtml(ht.getAttribute('title'));
  const metaDesc = stripHtml(ht.getAttribute('meta-desc'));
  const fullSummaryEl = ht.querySelector('full-summary');
  const fullSummary = fullSummaryEl ? stripHtml(fullSummaryEl.textContent) : null;

  if (!title || !pageUrl) return null;

  return {
    id: topicFilenameFromPageUrl(pageUrl) ?? pageUrl,
    title,
    summary: metaDesc || fullSummary,
    url: pageUrl,
    specialty: null,
    causes: null,
    symptoms: null,
    diagnosis: null,
    treatment: null,
    whenToSeeDoctor: null,
  };
}

async function wsearchHealthTopics(term, { retmax, rettype, signal }) {
  const params = new URLSearchParams({
    db: 'healthTopics',
    term,
    retmax: String(retmax),
    rettype,
  });
  const url = `${MEDLINEPLUS_WSEARCH}?${params}`;

  return dedupFetch(
    `medlineplus:wsearch:${term}:${retmax}:${rettype}`,
    () => fetchWithRetry(url, { signal }),
    signal,
  );
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
  /**
   * Plain-language search via MedlinePlus health topics web search (not Connect).
   */
  async search(rawQuery, signal) {
    const query = queryNormalize(rawQuery);
    if (!query) return [];

    const cacheKey = `medlineplus:search:${query}`;
    const cached = cacheGet(cacheKey);
    if (cached !== null) return cached;

    try {
      const xml = await wsearchHealthTopics(query, { retmax: 15, rettype: 'brief', signal });
      const results = parseHealthTopicsBriefXml(xml);

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

    const filename = topicFilenameFromId(id);
    const term = wsearchTermFromId(id);

    try {
      const xml = await wsearchHealthTopics(term, { retmax: 25, rettype: 'topic', signal });

      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      if (typeof xml !== 'string') {
        return makeFallback('medlineplus', new Error('Unexpected response'));
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      if (doc.querySelector('parsererror')) {
        return makeFallback('medlineplus', new Error('Unable to parse topic data'));
      }

      const documents = [...doc.querySelectorAll('document')];
      let chosen =
        filename != null
          ? documents.find(d => urlMatchesTopicFilename(d.getAttribute('url'), filename))
          : null;

      if (!chosen && documents.length === 1) chosen = documents[0];
      if (!chosen) chosen = documents[0] ?? null;

      if (!chosen) {
        return makeFallback('medlineplus', new Error('No result found'));
      }

      const result = parseHealthTopicDocument(chosen);
      if (!result) {
        return makeFallback('medlineplus', new Error('No result found'));
      }

      cacheSet(cacheKey, result, TTL_DISEASE);
      return result;
    } catch (err) {
      return makeFallback('medlineplus', err);
    }
  },

  /**
   * Merge several health-topic searches (no native browse API).
   * @param {{ specialty?: string, signal?: AbortSignal }} opts
   */
  async browse(opts = {}) {
    const key = opts.specialty && BROWSE_QUERIES_BY_SPECIALTY[opts.specialty]
      ? opts.specialty
      : 'all';
    const { signal } = opts;
    const queries = BROWSE_QUERIES_BY_SPECIALTY[key];
    const label = SPECIALTY_LABELS[key];

    const allRows = await Promise.all(queries.map(q => this.search(q, signal)));

    if (signal?.aborted) return [];

    const merged = new Map();
    for (const rows of allRows) {
      if (isFallback(rows)) return rows;
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
