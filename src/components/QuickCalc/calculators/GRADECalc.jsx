import { useState, useMemo } from 'react';

const DOMAINS = [
  {
    id: 'bias',
    label: 'Risk of bias',
    options: ['Not serious', 'Serious', 'Very serious'],
    deductions: [0, 1, 2],
  },
  {
    id: 'inconsistency',
    label: 'Inconsistency',
    options: ['Not serious', 'Serious', 'Very serious'],
    deductions: [0, 1, 2],
  },
  {
    id: 'indirectness',
    label: 'Indirectness',
    options: ['Not serious', 'Serious', 'Very serious'],
    deductions: [0, 1, 2],
  },
  {
    id: 'imprecision',
    label: 'Imprecision',
    options: ['Not serious', 'Serious', 'Very serious'],
    deductions: [0, 1, 2],
  },
  {
    id: 'pubBias',
    label: 'Publication bias',
    options: ['Undetected', 'Suspected', 'Strongly suspected'],
    deductions: [0, 1, 2],
  },
];

const SCORE_MAP = [
  { min: 4, label: 'High',      cls: 'qc-grade-result--high'     },
  { min: 3, label: 'Moderate',  cls: 'qc-grade-result--moderate' },
  { min: 2, label: 'Low',       cls: 'qc-grade-result--low'      },
  { min: 1, label: 'Very Low',  cls: 'qc-grade-result--verylow'  },
];

function gradeLabel(score) {
  for (const s of SCORE_MAP) {
    if (score >= s.min) return s;
  }
  return SCORE_MAP[SCORE_MAP.length - 1];
}

export default function GRADECalc() {
  const [startQuality, setStartQuality] = useState('high'); // 'high' | 'low'
  const [selections, setSelections] = useState({
    bias: 0,
    inconsistency: 0,
    indirectness: 0,
    imprecision: 0,
    pubBias: 0,
  });

  function setDomain(id, idx) {
    setSelections(prev => ({ ...prev, [id]: idx }));
  }

  const score = useMemo(() => {
    const base = startQuality === 'high' ? 4 : 2;
    const deduction = DOMAINS.reduce((sum, d) => sum + d.deductions[selections[d.id]], 0);
    return Math.max(1, base - deduction);
  }, [startQuality, selections]);

  const grade = gradeLabel(score);

  return (
    <div className="qc-calc-body">
      {/* Starting quality */}
      <div className="qc-input-group">
        <label>Starting quality</label>
        <div className="qc-toggle-row">
          <button
            type="button"
            className={'qc-toggle-btn' + (startQuality === 'high' ? ' active' : '')}
            onClick={() => setStartQuality('high')}
          >
            RCT (High)
          </button>
          <button
            type="button"
            className={'qc-toggle-btn' + (startQuality === 'low' ? ' active' : '')}
            onClick={() => setStartQuality('low')}
          >
            Observational (Low)
          </button>
        </div>
      </div>

      {/* Domain checklist */}
      {DOMAINS.map(domain => (
        <div className="qc-grade-domain" key={domain.id}>
          <span className="qc-grade-domain-label">{domain.label}</span>
          <div className="qc-grade-options">
            {domain.options.map((opt, idx) => (
              <label
                key={opt}
                className={
                  'qc-grade-option' +
                  (selections[domain.id] === idx ? ' active' : '')
                }
              >
                <input
                  type="radio"
                  name={'grade-' + domain.id}
                  value={idx}
                  checked={selections[domain.id] === idx}
                  onChange={() => setDomain(domain.id, idx)}
                />
                {opt}
                {domain.deductions[idx] > 0 && (
                  <span className="qc-grade-deduction">
                    −{domain.deductions[idx]}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* GRADE result */}
      <div className="qc-results">
        <div className={'qc-grade-result ' + grade.cls}>
          <span className="qc-grade-result-label">GRADE Quality</span>
          <span className="qc-grade-result-value">{grade.label}</span>
          <span className="qc-grade-result-score">Score: {score}/4</span>
        </div>
      </div>
    </div>
  );
}
