const RISK_LABELS = {
  low: 'Low risk',
  moderate: 'Moderate risk',
  high: 'High risk',
};

/**
 * Displays a computed calculator result.
 * Props:
 *   result  — { result, unit?, interpretation, risk? } from engine.runCalculator
 *   config  — calculator config (for references)
 */
export default function CalcResult({ result, config }) {
  if (!result) return null;

  const { result: value, unit, interpretation, risk } = result;

  return (
    <div className="cr-card" role="region" aria-label="Calculator result">
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
    </div>
  );
}
