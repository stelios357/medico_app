import { RXNORM_BASE, TTL_DRUG, TTL_INTERACTION } from '../utils/constants.js';
import { cacheGet, cacheSet } from './cache.js';
import { fetchWithRetry } from './retry.js';
import { dedupFetch } from './requestDedup.js';
import { makeFallback } from './fallback.js';
import { openFDA } from './openFDA.js';

const CLASS_TOKEN_BLOCKLIST = new Set([
  'derivatives', 'combinations', 'preparations', 'inhibitors', 'antagonists',
  'agonists', 'receptor', 'receptors', 'products', 'medications', 'substances',
]);

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function nameInHaystack(haystack, name) {
  const n = (name || '').toLowerCase().trim();
  if (n.length < 2) return { ok: false, index: -1 };
  const re = new RegExp(`\\b${escapeRe(n)}\\b`, 'i');
  const m = re.exec(haystack);
  return m ? { ok: true, index: m.index, matched: n } : { ok: false, index: -1 };
}

function classTokenMatchesHaystack(haystack, token) {
  const t = token.toLowerCase();
  if (t.length < 6 || CLASS_TOKEN_BLOCKLIST.has(t)) return { ok: false, index: -1 };
  let idx = haystack.indexOf(t);
  if (idx !== -1) return { ok: true, index: idx, matched: t };
  const stem = t.slice(0, Math.max(6, Math.min(8, t.length)));
  idx = haystack.indexOf(stem);
  if (idx !== -1) return { ok: true, index: idx, matched: stem };
  return { ok: false, index: -1 };
}

function concatLabelText(record) {
  if (!record) return '';
  const parts = [];
  const fields = [
    'drug_interactions',
    'contraindications',
    'warnings',
    'warnings_and_cautions',
    'boxed_warning',
  ];
  for (const f of fields) {
    const v = record[f];
    if (!v) continue;
    const arr = Array.isArray(v) ? v : [v];
    for (const s of arr) {
      if (typeof s === 'string' && s.trim()) parts.push(s);
    }
  }
  return parts.join('\n\n').toLowerCase();
}

function inferSeverity(snippet) {
  const s = (snippet || '').toLowerCase();
  if (/\b(contraindicated|do not co\-administer|do not use together|fatal|life.threatening)\b/i.test(s)) {
    return 'major';
  }
  if (/\b(severe|avoid|not recommended|contraindication)\b/i.test(s)) {
    return 'major';
  }
  if (/\b(monitor|may increase|may decrease|caution|adjust dose|dose adjustment|closely)\b/i.test(s)) {
    return 'moderate';
  }
  return 'moderate';
}

function extractSnippet(haystack, index) {
  if (index < 0 || !haystack) {
    return { text: '', hint: '' };
  }
  const half = 220;
  const start = Math.max(0, index - half);
  const end = Math.min(haystack.length, index + half);
  const raw = haystack.slice(start, end).replace(/\s+/g, ' ').trim();
  const hint = (start > 0 ? '…' : '') + raw + (end < haystack.length ? '…' : '');
  return { text: raw, hint };
}

async function fetchJson(url, signal) {
  const data = await fetchWithRetry(url, { signal });
  if (typeof data === 'string' && data.includes('Not found')) return null;
  return data;
}

async function fetchCanonicalName(rxcui, signal) {
  const cacheKey = `rxnorm:idname:${rxcui}`;
  const cached = cacheGet(cacheKey);
  if (cached !== null) return cached;

  const url = `${RXNORM_BASE}/rxcui/${encodeURIComponent(rxcui)}.json`;
  try {
    const data = await dedupFetch(cacheKey, () => fetchJson(url, signal), signal);
    const name = data?.idGroup?.name ?? null;
    if (name) cacheSet(cacheKey, name, TTL_DRUG);
    return name;
  } catch {
    cacheSet(cacheKey, null, TTL_DRUG);
    return null;
  }
}

async function fetchClassSearchTerms(rxcui, signal) {
  const cacheKey = `rxnorm:rxclassterms:${rxcui}`;
  const cached = cacheGet(cacheKey);
  if (cached !== null) return cached;

  const url = `${RXNORM_BASE}/rxclass/class/byRxcui.json?rxcui=${encodeURIComponent(rxcui)}`;
  try {
    const data = await dedupFetch(cacheKey, () => fetchJson(url, signal), signal);
    const list = data?.rxclassDrugInfoList?.rxclassDrugInfo ?? [];
    const terms = new Set();
    for (const item of list) {
      const ct = item?.rxclassMinConceptItem?.classType;
      const cn = item?.rxclassMinConceptItem?.className;
      if (ct !== 'ATC1-4' || !cn) continue;
      for (const tok of cn.toLowerCase().split(/[^a-z0-9]+/)) {
        if (tok.length >= 6 && !CLASS_TOKEN_BLOCKLIST.has(tok)) terms.add(tok);
      }
    }
    const arr = [...terms];
    cacheSet(cacheKey, arr, TTL_DRUG);
    return arr;
  } catch {
    cacheSet(cacheKey, [], TTL_DRUG);
    return [];
  }
}

function findMention(haystack, names, classTokens) {
  if (!haystack) return null;
  for (const n of names) {
    const hit = nameInHaystack(haystack, n);
    if (hit.ok) return { ...hit, via: 'name' };
  }
  for (const tok of classTokens) {
    const hit = classTokenMatchesHaystack(haystack, tok);
    if (hit.ok) return { ...hit, via: 'class' };
  }
  return null;
}

/**
 * Pairwise interaction screening from FDA SPL text (RxNorm DDI API was discontinued 2024).
 * @param {{ name: string, rxcui: string }[]} drugs
 */
export async function checkDrugInteractions(drugs, signal) {
  if (!Array.isArray(drugs) || drugs.length < 2) {
    return makeFallback('interactions', new Error('At least 2 drugs required'));
  }

  const sortedKey = drugs
    .map(d => `${String(d.rxcui)}:${(d.name || '').toLowerCase()}`)
    .sort()
    .join('|');
  const cacheKey = `ddi:openfda:${sortedKey}`;
  const cached = cacheGet(cacheKey);
  if (cached !== null) return cached;

  try {
    const haystacks = [];
    const termPayloads = [];
    let anyLabel = false;

    for (const d of drugs) {
      const rxcui = String(d.rxcui);
      const labelRec = await openFDA.firstMatchingLabelRecord(d.name, signal);
      const hay = concatLabelText(labelRec);
      if (hay.length) anyLabel = true;
      haystacks.push(hay);

      const [canonical, classTokens] = await Promise.all([
        fetchCanonicalName(rxcui, signal),
        fetchClassSearchTerms(rxcui, signal),
      ]);

      const names = new Set();
      const addName = (x) => {
        const v = (x || '').toLowerCase().trim();
        if (v.length >= 2) names.add(v);
      };
      addName(d.name);
      addName(canonical);

      termPayloads.push({
        names: [...names],
        classTokens,
      });
    }

    if (!anyLabel) {
      const fb = makeFallback(
        'interactions',
        new Error('No FDA labeling retrieved for these drugs'),
      );
      cacheSet(cacheKey, fb, TTL_INTERACTION);
      return fb;
    }

    const results = [];
    const pairKeys = new Set();

    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const nameA = drugs[i].name || '';
        const nameB = drugs[j].name || '';

        let hit = findMention(haystacks[i], termPayloads[j].names, termPayloads[j].classTokens);
        let hay = haystacks[i];
        let sourceDrug = nameA;

        if (!hit) {
          hit = findMention(haystacks[j], termPayloads[i].names, termPayloads[i].classTokens);
          hay = haystacks[j];
          sourceDrug = nameB;
        }

        if (!hit) continue;

        const { hint } = extractSnippet(hay, hit.index);
        const severity = inferSeverity(hay.slice(Math.max(0, hit.index - 80), hit.index + 200));

        const key = [nameA, nameB].sort().join('\x00');
        if (pairKeys.has(key)) continue;
        pairKeys.add(key);

        results.push({
          drugA: nameA,
          drugB: nameB,
          severity,
          description:
            hint ||
            `FDA label (${sourceDrug}) references the other agent or its class — confirm with current references.`,
        });
      }
    }

    cacheSet(cacheKey, results, TTL_INTERACTION);
    return results;
  } catch (err) {
    return makeFallback('interactions', err);
  }
}
