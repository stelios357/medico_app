import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { calcDrugMap } from '../../data/calcDrugMap.js';
import { openFDA } from '../../services/openFDA.js';

const RISK_LABELS = {
  low: 'Low risk',
  moderate: 'Moderate risk',
  high: 'High risk',
};

function DrugChip({ drug }) {
  const name = drug.brandName || drug.genericName || '—';
  const sub  = drug.brandName && drug.genericName ? drug.genericName : null;
  return (
    <Link to={`/drug/${drug.id}`} className="cd-chip clickable" aria-label={`View ${name} drug details`}>
      <span className="cd-chip-name">{name}</span>
      {sub && <span className="cd-chip-sub">{sub}</span>}
      {drug.isRx && <span className="cd-chip-badge">Rx</span>}
    </Link>
  );
}

function useDrugSuggestions(slug, resultValue) {
  const [drugs, setDrugs]     = useState([]);
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(0);
  const cache      = useRef({});

  useEffect(() => {
    const entry = slug ? calcDrugMap[slug] : null;
    const shouldFetch = entry && typeof resultValue === 'number' && resultValue >= entry.threshold;

    if (!shouldFetch) {
      setDrugs([]);
      setLoading(false);
      return;
    }

    // Step 2 — return cached result immediately, no loading flash
    const cacheKey = `${slug}:${resultValue}`;
    if (cache.current[cacheKey]) {
      setDrugs(cache.current[cacheKey]);
      setLoading(false);
      return;
    }

    // Step 1 — stamp this request so stale responses are discarded
    const currentRequest = ++requestRef.current;
    setLoading(true);
    setDrugs([]);

    const priority = entry.priority ?? {};

    Promise.allSettled(entry.drugs.map(kw => openFDA.search(kw)))
      .then(settled => {
        // Step 1 — discard if a newer request has since been issued
        if (currentRequest !== requestRef.current) return;

        // Steps 4 — sort by priority, limit to 4
        const found = settled
          .map((r, i) => ({
            drug: r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0
              ? r.value[0]
              : null,
            keyword: entry.drugs[i],
          }))
          .filter(({ drug }) => drug && !drug.error)
          .sort((a, b) => (priority[a.keyword] ?? 999) - (priority[b.keyword] ?? 999))
          .slice(0, 4)
          .map(({ drug }) => drug);

        cache.current[cacheKey] = found;
        setDrugs(found);
        setLoading(false);
      });
  }, [slug, resultValue]);

  const entry = slug ? calcDrugMap[slug] : null;
  const active = entry && typeof resultValue === 'number' && resultValue >= entry.threshold;
  return { drugs, loading, label: entry?.label ?? '', active };
}

/**
 * Displays a computed calculator result.
 * Props:
 *   result  — { result, unit?, interpretation, risk?, breakdown? } from engine.runCalculator
 *   config  — calculator config (for references, version, and drug suggestions)
 */
export default function CalcResult({ result, config }) {
  const { drugs, loading, label, active } = useDrugSuggestions(
    config?.slug,
    result ? result.result : undefined,
  );

  if (!result) return null;

  const { result: value, unit, interpretation, risk, breakdown } = result;

  return (
    <div className="cr-card" role="region" aria-label="Calculator result">
      {config?.version && (
        <p className="cr-version">Using {config.version}</p>
      )}

      <div className="cr-score-row">
        <span className="cr-score">{value}</span>
        {unit && <span className="cr-unit">{unit}</span>}
        {risk && (
          <span className={`cr-risk cr-risk--${risk}`} aria-label={RISK_LABELS[risk]}>
            {RISK_LABELS[risk] ?? risk}
          </span>
        )}
      </div>

      <p className="cr-interpretation">{interpretation}</p>

      {breakdown?.length > 0 && (
        <div className="cr-breakdown">
          <p className="cr-ref-label">Score Breakdown</p>
          <ul className="cr-breakdown-list">
            {breakdown.map((item, i) => (
              <li key={i} className="cr-breakdown-item">
                <span>{item.label}</span>
                <span className="cr-breakdown-pts">+{item.points}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {active && (
        <div className="cd-suggestions">
          <p className="cr-ref-label">{label}</p>
          {loading && <p className="cd-loading calc-loading">Loading suggestions...</p>}
          {!loading && drugs.length > 0 && (
            <div className="cd-chips">
              {drugs.map(d => <DrugChip key={d.id} drug={d} />)}
            </div>
          )}
          {!loading && drugs.length === 0 && (
            <p className="cd-loading">No drug data available at this time.</p>
          )}
        </div>
      )}

      {config?.references?.length > 0 && (
        <div className="cr-references">
          <p className="cr-ref-label">References</p>
          <ul className="cr-ref-list">
            {config.references.map((ref, i) => (
              <li key={i} className="cr-ref-item">{ref}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 7 — print safety disclaimer */}
      <p className="calc-print-disclaimer">
        This output is for reference only. Not a prescription.
      </p>
    </div>
  );
}
