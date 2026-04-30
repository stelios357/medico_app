import { useState, useMemo } from 'react';
import { calcCI } from '../mathUtils.js';

const STAT_TYPES = [
  { value: 'proportion', label: 'Proportion' },
  { value: 'mean',       label: 'Mean' },
  { value: 'RR',         label: 'Relative Risk (RR)' },
  { value: 'OR',         label: 'Odds Ratio (OR)' },
];

const CONFIDENCES = [90, 95, 99];

// Simple inline SVG number line visualisation
function CINumberLine({ lower, upper, estimate }) {
  const lo = parseFloat(lower);
  const hi = parseFloat(upper);
  const est = parseFloat(estimate);
  if (isNaN(lo) || isNaN(hi) || isNaN(est)) return null;

  const padding = (hi - lo) * 0.3 || 0.1;
  const viewMin = lo - padding;
  const viewMax = hi + padding;
  const range = viewMax - viewMin || 1;

  function toX(v) {
    return ((v - viewMin) / range) * 240 + 10;
  }

  const xLo  = toX(lo);
  const xHi  = toX(hi);
  const xEst = toX(est);

  return (
    <div className="qc-numberline-wrap" aria-hidden="true">
      <svg viewBox="0 0 260 40" className="qc-numberline-svg" role="img">
        {/* axis */}
        <line x1="10" y1="20" x2="250" y2="20" stroke="var(--border)" strokeWidth="1.5" />

        {/* CI bar */}
        <line x1={xLo} y1="20" x2={xHi} y2="20" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" />

        {/* CI end caps */}
        <line x1={xLo} y1="14" x2={xLo} y2="26" stroke="var(--teal)" strokeWidth="2" />
        <line x1={xHi} y1="14" x2={xHi} y2="26" stroke="var(--teal)" strokeWidth="2" />

        {/* Estimate dot */}
        <circle cx={xEst} cy="20" r="5" fill="var(--teal)" />
        <circle cx={xEst} cy="20" r="2.5" fill="var(--white)" />

        {/* Labels */}
        <text x={xLo} y="36" textAnchor="middle" fontSize="7" fill="var(--muted)" fontFamily="var(--mono)">
          {lo.toFixed(3)}
        </text>
        <text x={xHi} y="36" textAnchor="middle" fontSize="7" fill="var(--muted)" fontFamily="var(--mono)">
          {hi.toFixed(3)}
        </text>
        <text x={xEst} y="10" textAnchor="middle" fontSize="7" fill="var(--teal)" fontFamily="var(--mono)">
          {est}
        </text>
      </svg>
    </div>
  );
}

export default function CICalc() {
  const [statType,   setStatType]   = useState('proportion');
  const [estimate,   setEstimate]   = useState('');
  const [seMode,     setSeMode]     = useState('n'); // 'n' | 'se'
  const [n,          setN]          = useState('');
  const [se,         setSe]         = useState('');
  const [confidence, setConfidence] = useState(95);

  const result = useMemo(() => {
    if (estimate === '') return null;
    const nVal  = seMode === 'n'  ? n  : '';
    const seVal = seMode === 'se' ? se : '';
    if (nVal === '' && seVal === '') return null;
    return calcCI(statType, estimate, nVal || undefined, seVal || undefined, confidence);
  }, [statType, estimate, seMode, n, se, confidence]);

  return (
    <div className="qc-calc-body">
      {/* Statistic type */}
      <div className="qc-input-group">
        <label htmlFor="qc-ci-type">Statistic type</label>
        <select
          id="qc-ci-type"
          value={statType}
          onChange={e => setStatType(e.target.value)}
        >
          {STAT_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Point estimate */}
      <div className="qc-input-group">
        <label htmlFor="qc-ci-est">
          Point estimate
          {(statType === 'RR' || statType === 'OR') && ' (natural scale)'}
        </label>
        <input
          id="qc-ci-est"
          type="number"
          step="any"
          placeholder={statType === 'proportion' ? '0.0 – 1.0' : 'e.g. 2.4'}
          value={estimate}
          onChange={e => setEstimate(e.target.value)}
        />
      </div>

      {/* n / SE toggle */}
      <div className="qc-toggle-row">
        <button
          type="button"
          className={'qc-toggle-btn' + (seMode === 'n' ? ' active' : '')}
          onClick={() => setSeMode('n')}
        >
          Sample size (n)
        </button>
        <button
          type="button"
          className={'qc-toggle-btn' + (seMode === 'se' ? ' active' : '')}
          onClick={() => setSeMode('se')}
        >
          Std. Error (SE)
        </button>
      </div>

      {seMode === 'n' ? (
        <div className="qc-input-group">
          <label htmlFor="qc-ci-n">Sample size (n)</label>
          <input
            id="qc-ci-n"
            type="number"
            min="2"
            step="1"
            placeholder="e.g. 200"
            value={n}
            onChange={e => setN(e.target.value)}
          />
        </div>
      ) : (
        <div className="qc-input-group">
          <label htmlFor="qc-ci-se">
            Standard error
            {(statType === 'RR' || statType === 'OR') && ' of ln(RR/OR)'}
          </label>
          <input
            id="qc-ci-se"
            type="number"
            step="any"
            min="0"
            placeholder="e.g. 0.12"
            value={se}
            onChange={e => setSe(e.target.value)}
          />
        </div>
      )}

      {/* Confidence level */}
      <div className="qc-radio-row">
        {CONFIDENCES.map(c => (
          <label key={c} className="qc-radio-label">
            <input
              type="radio"
              name="qc-conf"
              value={c}
              checked={confidence === c}
              onChange={() => setConfidence(c)}
            />
            {c}%
          </label>
        ))}
      </div>

      {/* Output */}
      {result && (
        result.error ? (
          <p className="qc-error">{result.error}</p>
        ) : (
          <div className="qc-results">
            <div className="qc-result-primary">
              <span className="qc-result-label">{confidence}% CI</span>
              <span className="qc-result-value">
                {result.lower} – {result.upper}
              </span>
            </div>

            <div className="qc-result-row">
              <span className="qc-result-key">z-score</span>
              <span className="qc-result-mono">{result.zScore}</span>
            </div>

            <div className="qc-result-row">
              <span className="qc-result-key">SE used</span>
              <span className="qc-result-mono">{result.se}</span>
            </div>

            <CINumberLine
              lower={result.lower}
              upper={result.upper}
              estimate={estimate}
            />
          </div>
        )
      )}

      {!result && (
        <p className="qc-hint">Enter estimate and n or SE to compute CI.</p>
      )}
    </div>
  );
}
