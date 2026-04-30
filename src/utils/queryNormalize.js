const STOPWORDS = new Set(['the', 'a', 'an', 'of', 'for', 'and', 'or', 'with']);

const SYNONYMS = {
  'bp': 'blood pressure',
  'mi': 'myocardial infarction',
  'dm': 'diabetes mellitus',
  'htn': 'hypertension',
  'afib': 'atrial fibrillation',
  'cad': 'coronary artery disease',
  'ckd': 'chronic kidney disease',
  'chf': 'congestive heart failure',
  'copd': 'chronic obstructive pulmonary disease',
  'dvt': 'deep vein thrombosis',
};

export function queryNormalize(raw) {
  if (typeof raw !== 'string') return null;

  let q = raw.toLowerCase().trim();
  if (!q) return null;

  // Apply synonym map on the whole query before tokenizing
  if (SYNONYMS[q]) {
    q = SYNONYMS[q];
  }

  // Tokenize, strip stopwords
  const tokens = q.split(/\s+/).filter(t => t && !STOPWORDS.has(t));

  if (tokens.length === 0) return null;

  return tokens.join(' ');
}
