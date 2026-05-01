import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import CalcInput from '../components/calculators/CalcInput.jsx';
import CalcResult from '../components/calculators/CalcResult.jsx';
import { getCalculatorBySlug } from '../data/calculatorRegistry.js';
import { runCalculator } from '../services/calculators/engine.js';
import { useCalcHistory } from '../hooks/useCalcHistory.js';
import '../styles/calculators.css';

function specialtyLabel(raw) {
  if (!raw) return '';
  if (raw === 'obgyn') return 'OB/GYN';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function initialInputValues(config) {
  const values = {};
  for (const input of config.inputs) {
    if (input.type === 'checkbox') {
      values[input.id] = false;
    } else if (input.type === 'select') {
      // honour explicit defaults (e.g. creatinineUnit defaults to 0 = mg/dL)
      values[input.id] = input.default !== undefined ? String(input.default) : '';
    } else {
      values[input.id] = '';
    }
  }
  return values;
}

export default function ClinicalCalculator() {
  const { slug } = useParams();
  const config = useMemo(() => getCalculatorBySlug(slug), [slug]);

  const [inputValues, setInputValues] = useState(() =>
    config ? initialInputValues(config) : {}
  );
  const [result, setResult] = useState(null);

  const { add: addToHistory } = useCalcHistory();

  const handleInputChange = useCallback((id, value) => {
    setInputValues(prev => ({ ...prev, [id]: value }));
    setResult(null);
  }, []);

  // Per-field range validation (number inputs only)
  const validationErrors = useMemo(() => {
    if (!config) return {};
    const errors = {};
    for (const input of config.inputs) {
      if (input.type !== 'number') continue;
      const raw = inputValues[input.id];
      if (raw === '' || raw === null || raw === undefined) continue;
      const n = Number(raw);
      if (!isFinite(n)) {
        errors[input.id] = 'Invalid number';
        continue;
      }
      if (input.min !== undefined && n < input.min)
        errors[input.id] = `Min: ${input.min}`;
      else if (input.max !== undefined && n > input.max)
        errors[input.id] = `Max: ${input.max}`;
    }
    return errors;
  }, [config, inputValues]);

  const isCalculateReady = useMemo(() => {
    if (!config) return false;
    if (Object.keys(validationErrors).length > 0) return false;
    return config.inputs.every(input => {
      const val = inputValues[input.id];
      if (input.type === 'checkbox') return true;
      return val !== '' && val !== null && val !== undefined;
    });
  }, [config, inputValues, validationErrors]);

  function handleCalculate() {
    const computed = runCalculator(config, inputValues);
    setResult(computed);
    if (computed) {
      addToHistory({
        slug: config.slug,
        name: config.name,
        result: computed.result,
        unit: computed.unit ?? '',
        interpretation: computed.interpretation,
      });
    }
  }

  if (!config) {
    return (
      <>
        <Nav />
        <main className="cp-page">
          <div className="cp-container">
            <Link to="/calculators" className="cp-back-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
              All calculators
            </Link>
            <div className="cp-notfound">
              <h2 className="cp-notfound-title">Calculator not found</h2>
              <p className="cp-notfound-msg">No calculator exists for the slug "{slug}".</p>
              <Link to="/calculators" className="cp-back-link">Browse all calculators</Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="cp-page">
        <div className="cp-container">
          <Link to="/calculators" className="cp-back-link">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
            All calculators
          </Link>

          <div className="cp-header">
            <div className="cp-title-row">
              <h1 className="cp-title">{config.name}</h1>
              <span className="cp-specialty-badge">{specialtyLabel(config.specialty)}</span>
            </div>
            <p className="cp-description">{config.description}</p>
          </div>

          <div className="cp-form" role="form" aria-label={`${config.name} inputs`}>
            {config.inputs.map(input => (
              <CalcInput
                key={input.id}
                input={input}
                value={inputValues[input.id]}
                onChange={handleInputChange}
                error={validationErrors[input.id]}
              />
            ))}
          </div>

          <button
            type="button"
            className="cp-calc-btn"
            onClick={handleCalculate}
            disabled={!isCalculateReady}
          >
            Calculate
          </button>

          {result && (
            <CalcResult result={result} config={config} />
          )}

          {result === null && isCalculateReady === false && config.inputs.length > 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--mono)', textAlign: 'center' }}>
              Fill in all fields to enable calculation.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
