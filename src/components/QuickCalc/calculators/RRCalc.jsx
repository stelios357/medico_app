import { useState, useMemo } from 'react';
import { calcRR } from '../mathUtils.js';

function InterpBadge({ interpretation }) {
  const map = {
    protective: { label: 'Protective', cls: 'qc-badge qc-badge--teal' },
    harmful:    { label: 'Harmful',    cls: 'qc-badge qc-badge--amber' },
    neutral:    { label: 'Neutral',    cls: 'qc-badge qc-badge--muted' },
  };
  const config = map[interpretation] ?? map.neutral;
  return <span className={config.cls}>{config.label}</span>;
}

export default function RRCalc() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [d, setD] = useState('');

  const result = useMemo(() => {
    if ([a, b, c, d].some(v => v === '')) return null;
    return calcRR(a, b, c, d);
  }, [a, b, c, d]);

  const cells = [
    { id: 'a', label: 'Exposed, outcome+',   value: a, set: setA },
    { id: 'b', label: 'Exposed, outcome−',   value: b, set: setB },
    { id: 'c', label: 'Unexposed, outcome+', value: c, set: setC },
    { id: 'd', label: 'Unexposed, outcome−', value: d, set: setD },
  ];

  return (
    <div className="qc-calc-body">
      {/* 2×2 table inputs */}
      <div className="qc-2x2-grid">
        {cells.map(cell => (
          <div className="qc-input-group" key={cell.id}>
            <label htmlFor={'qc-rr-' + cell.id}>{cell.label}</label>
            <input
              id={'qc-rr-' + cell.id}
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={cell.value}
              onChange={e => cell.set(e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Output */}
      {result && (
        result.error ? (
          <p className="qc-error">{result.error}</p>
        ) : (
          <div className="qc-results">
            <div className="qc-result-row qc-result-row--badge">
              <InterpBadge interpretation={result.interpretation} />
            </div>

            <div className="qc-result-primary">
              <span className="qc-result-label">Relative Risk</span>
              <span className="qc-result-value">{result.rr}</span>
            </div>

            <div className="qc-result-row">
              <span className="qc-result-key">RR 95% CI</span>
              <span className="qc-result-mono">
                {result.rrCiLow} – {result.rrCiHigh}
              </span>
            </div>

            <div className="qc-result-row">
              <span className="qc-result-key">Odds Ratio</span>
              <span className="qc-result-mono">{result.or_}</span>
            </div>

            <div className="qc-result-row">
              <span className="qc-result-key">OR 95% CI</span>
              <span className="qc-result-mono">
                {result.orCiLow} – {result.orCiHigh}
              </span>
            </div>
          </div>
        )
      )}

      {!result && (
        <p className="qc-hint">Fill all four cells of the 2×2 table.</p>
      )}
    </div>
  );
}
