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

function safeField(arr) {
  // arr may be an array (OpenFDA standard) or a bare string (some label variants)
  let raw;
  if (Array.isArray(arr)) {
    raw = arr[0] ?? null;
  } else if (typeof arr === 'string') {
    raw = arr || null;
  } else {
    raw = null;
  }
  return stripHtml(raw);
}

function firstSentence(text, maxLen = 120) {
  if (!text) return null;
  const match = text.match(/^([^.!?]+[.!?])/);
  // If no sentence boundary found, fall back to hard truncation of full text
  const sentence = match ? match[1].trim() : text;
  if (sentence.length <= maxLen) return sentence;
  return sentence.slice(0, maxLen - 1) + '…';
}

export function formatDrug(raw) {
  if (!raw) return null;

  const r = raw.results?.[0] ?? raw;

  const brandName = safeField(r.openfda?.brand_name) ??
    safeField(r.brand_name) ?? null;
  const genericName = safeField(r.openfda?.generic_name) ??
    safeField(r.generic_name) ?? null;

  const pharmClass = r.openfda?.pharm_class_epc?.[0] || null;
  const drugClass = stripHtml(pharmClass);

  const isRx = Array.isArray(r.openfda?.product_type)
    ? r.openfda.product_type.some(t => /prescription/i.test(t))
    : Boolean(r.prescription_drug);

  const hasBlackBoxWarning = Boolean(r.boxed_warning?.[0]);

  const indicationsRaw = safeField(r.indications_and_usage);
  const indicationShort = firstSentence(indicationsRaw, 120);

  return {
    id: r.id ?? r.set_id ?? null,
    brandName,
    genericName,
    drugClass,
    isRx,
    hasBlackBoxWarning,
    indicationShort,
    indications: indicationsRaw,
    dosage: safeField(r.dosage_and_administration),
    contraindications: safeField(r.contraindications),
    warnings: safeField(r.warnings_and_cautions) ?? safeField(r.warnings),
    adverseEffects: safeField(r.adverse_reactions),
    pregnancy: safeField(r.pregnancy) ?? safeField(r.teratogenic_effects),
    storage: safeField(r.storage_and_handling),
    manufacturer: r.openfda?.manufacturer_name?.[0] ?? null,
  };
}

export function formatDrugList(response) {
  if (!response?.results) return [];
  return response.results.map(r => formatDrug({ results: [r] })).filter(Boolean);
}
