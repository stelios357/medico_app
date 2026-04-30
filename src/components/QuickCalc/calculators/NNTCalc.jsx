import { useState, useMemo } from 'react';
import { calcNNT } from '../mathUtils.js';

export default function NNTCalc() {
  const [cer, setCer] = useState('');
  const [eer, setEer] = useState('');
  const [mode, setMode] = useState('benefit'); // 'benefit' | 'harm'

  const result = useMemo(() => {
    if (cer === '' || eer === '') return null;
    return calcNNT(cer, eer);
  }, [cer, eer]);

  const label = mode === 'benefit' ? 'NNT' : 'NNH';

  return (
    <div className="qc-calc-body">
      {/* Mode toggle */}
      <div className="qc-toggle-row">
        <button
          className={'qc-toggle-btn' + (mode === 'benefit' ? ' active' : '')}
          onClick={() => setMode('benefit')}
          type="button"
        >
          Benefit (NNT)
        </button>
        <button
          className={'qc-toggle-btn' + (mode === 'harm' ? ' active' : '')}
          onClick={() => setMode('harm')}
          type="button"
        >
          Harm (NNH)
        </button>
      </div>

      {/* Inputs */}
      <div className="qc-input-group">
        <label htmlFor="qc-cer">Control group events (%)</label>
        <input
          id="qc-cer"
          type="number"
          min="0"
          max="100"
          step="0.1"
          placeholder="e.g. 30"
          value={cer}
          onChange={e => setCer(e.target.value)}
        />
      </div>

      <div className="qc-input-group">
        <label htmlFor="qc-eer">Treatment group events (%)</label>
        <input
          id="qc-eer"
          type="number"
          min="0"
          max="100"
          step="0.1"
          placeholder="e.g. 20"
          value={eer}
          onChange={e => setEer(e.target.value)}
        />
      </div>

      {/* Output */}
      {result && (
        result.error ? (
          <p className="qc-error">{result.error}</p>
        ) : (
          <div className="qc-results">
            <div className="qc-result-primary">
              <span className="qc-result-label">{label}</span>
              <span className="qc-result-value">{result.nnt}</span>
            </div>

            <div className="qc-result-row">
              <span className="qc-result-key">ARR</span>
              <span className="qc-result-mono">{result.arr}%</span>
            </div>

            <div className="qc-result-row">
              <span className="qc-result-key">95% CI</span>
              <span className="qc-result-mono">
                {result.ciLow} – {result.ciHigh}
              </span>
            </div>

            <div className="qc-result-row qc-result-row--interp">
              <span className="qc-interp-text">{result.interpretation}</span>
            </div>
          </div>
        )
      )}

      {!result && (
        <p className="qc-hint">Enter both event rates to calculate.</p>
      )}
    </div>
  );
}
