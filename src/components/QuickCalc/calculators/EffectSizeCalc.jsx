import { useState, useMemo } from 'react';
import { calcEffectSize } from '../mathUtils.js';

const INTERP_LABELS = {
  negligible: { label: 'Negligible', cls: 'qc-badge qc-badge--muted' },
  small:      { label: 'Small',      cls: 'qc-badge qc-badge--muted' },
  medium:     { label: 'Medium',     cls: 'qc-badge qc-badge--amber' },
  large:      { label: 'Large',      cls: 'qc-badge qc-badge--teal'  },
};

export default function EffectSizeCalc() {
  const [mean1, setMean1] = useState('');
  const [mean2, setMean2] = useState('');
  const [sd1,   setSd1]   = useState('');
  const [sd2,   setSd2]   = useState('');
  const [n1,    setN1]    = useState('');
  const [n2,    setN2]    = useState('');

  const result = useMemo(() => {
    if ([mean1, mean2, sd1, sd2, n1, n2].some(v => v === '')) return null;
    return calcEffectSize(mean1, mean2, sd1, sd2, n1, n2);
  }, [mean1, mean2, sd1, sd2, n1, n2]);

  const fields = [
    { id: 'mean1', label: 'Mean 1',  value: mean1, set: setMean1, step: 'any' },
    { id: 'mean2', label: 'Mean 2',  value: mean2, set: setMean2, step: 'any' },
    { id: 'sd1',   label: 'SD 1',    value: sd1,   set: setSd1,   step: 'any', min: '0' },
    { id: 'sd2',   label: 'SD 2',    value: sd2,   set: setSd2,   step: 'any', min: '0' },
    { id: 'n1',    label: 'n₁',      value: n1,    set: setN1,    step: '1',   min: '2' },
    { id: 'n2',    label: 'n₂',      value: n2,    set: setN2,    step: '1',   min: '2' },
  ];

  const badgeCfg = result && !result.error
    ? (INTERP_LABELS[result.interpretation] ?? INTERP_LABELS.negligible)
    : null;

  return (
    <div className="qc-calc-body">
      <div className="qc-2col-grid">
        {fields.map(f => (
          <div className="qc-input-group" key={f.id}>
            <label htmlFor={'qc-es-' + f.id}>{f.label}</label>
            <input
              id={'qc-es-' + f.id}
              type="number"
              step={f.step}
              min={f.min}
              placeholder="—"
              value={f.value}
              onChange={e => f.set(e.target.value)}
            />
          </div>
        ))}
      </div>

      {result && (
        result.error ? (
          <p className="qc-error">{result.error}</p>
        ) : (
          <div className="qc-results">
            <div className="qc-result-primary">
              <span className="qc-result-label">Cohen's d</span>
              <span className="qc-result-value">{result.d}</span>
            </div>

            <div className="qc-result-row qc-result-row--badge">
              <span className="qc-result-key">Magnitude</span>
              {badgeCfg && (
                <span className={badgeCfg.cls}>{badgeCfg.label}</span>
              )}
            </div>

            <div className="qc-result-row">
              <span className="qc-result-key">Approx. NNT from d</span>
              <span className="qc-result-mono">{result.nntFromD}</span>
            </div>
          </div>
        )
      )}

      {!result && (
        <p className="qc-hint">Fill all six fields to compute Cohen's d.</p>
      )}
    </div>
  );
}
