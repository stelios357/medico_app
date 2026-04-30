import { useState } from 'react';
import clinicalTerms from '../../data/clinicalTerms.json';

const OUTCOME_OPTIONS = [
  'Mortality', 'Hospitalization', 'Quality of life', 'Symptom relief',
  'Adverse events', 'Readmission', 'Length of stay', 'Functional outcomes',
  'Cost', 'Other',
];

const COMPARATOR_PRESETS = [
  'No treatment',
  'Standard of care',
  'Placebo',
  'Another intervention (specify below)',
];

function termsByCategory(cat) {
  return clinicalTerms.filter(t => t.category === cat).map(t => t.term);
}

export default function PICOStepForm({ step, value, onChange, onNext, onBack, isLastStep }) {
  const [customComparator, setCustomComparator] = useState('');

  function handleKeyDown(e) {
    if (e.key === 'Enter') onNext();
    if (e.key === 'Escape') {
      // parent handles escape
    }
  }

  // Step 1 — Population
  if (step === 0) {
    const suggestions = termsByCategory('population');
    return (
      <div className="pico-step">
        <p className="pico-step-label">Who is your patient?</p>
        <p className="pico-step-sub">Describe the population or patient group.</p>
        <input
          className="pico-input"
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. adults with type 2 diabetes, BMI >30"
          autoFocus
          aria-label="Population"
        />
        <div className="pico-chips-row">
          {suggestions.slice(0, 8).map(s => (
            <button
              key={s}
              className={`pico-suggest-chip${value === s ? ' selected' : ''}`}
              onClick={() => onChange(s)}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
        <NavRow onNext={onNext} canNext={value.trim().length > 0} isFirst />
      </div>
    );
  }

  // Step 2 — Intervention
  if (step === 1) {
    const suggestions = termsByCategory('intervention');
    return (
      <div className="pico-step">
        <p className="pico-step-label">What are you considering doing?</p>
        <p className="pico-step-sub">Name the intervention, drug, or procedure.</p>
        <input
          className="pico-input"
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. GLP-1 agonist, bariatric surgery"
          autoFocus
          aria-label="Intervention"
        />
        <div className="pico-chips-row">
          {suggestions.slice(0, 8).map(s => (
            <button
              key={s}
              className={`pico-suggest-chip${value === s ? ' selected' : ''}`}
              onClick={() => onChange(s)}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
        <NavRow onNext={onNext} onBack={onBack} canNext={value.trim().length > 0} />
      </div>
    );
  }

  // Step 3 — Comparator
  if (step === 2) {
    const isCustom = value && !COMPARATOR_PRESETS.slice(0, 3).includes(value) && value !== 'Another intervention (specify below)';
    return (
      <div className="pico-step">
        <p className="pico-step-label">Compared to what?</p>
        <p className="pico-step-sub">Select a comparator or specify your own.</p>
        <div className="pico-comparator-options">
          {COMPARATOR_PRESETS.map(opt => (
            <button
              key={opt}
              className={`pico-comparator-opt${(value === opt || (opt === 'Another intervention (specify below)' && isCustom)) ? ' selected' : ''}`}
              onClick={() => {
                if (opt === 'Another intervention (specify below)') {
                  onChange(customComparator || '');
                } else {
                  onChange(opt);
                }
              }}
              type="button"
            >
              {opt}
            </button>
          ))}
        </div>
        {(value === 'Another intervention (specify below)' || isCustom) && (
          <input
            className="pico-input"
            type="text"
            value={isCustom ? value : customComparator}
            onChange={e => { setCustomComparator(e.target.value); onChange(e.target.value); }}
            placeholder="Specify the comparator"
            autoFocus
          />
        )}
        <NavRow onNext={onNext} onBack={onBack} canNext={value.trim().length > 0} />
      </div>
    );
  }

  // Step 4 — Outcome
  if (step === 3) {
    const selected = Array.isArray(value) ? value : [];
    function toggleOutcome(o) {
      if (selected.includes(o)) onChange(selected.filter(x => x !== o));
      else onChange([...selected, o]);
    }
    return (
      <div className="pico-step">
        <p className="pico-step-label">What outcome matters most?</p>
        <p className="pico-step-sub">Select one or more outcomes.</p>
        <div className="pico-outcome-chips">
          {OUTCOME_OPTIONS.map(o => (
            <button
              key={o}
              className={`pico-outcome-chip${selected.includes(o) ? ' selected' : ''}`}
              onClick={() => toggleOutcome(o)}
              type="button"
              aria-pressed={selected.includes(o)}
            >
              {o}
            </button>
          ))}
        </div>
        <NavRow onNext={onNext} onBack={onBack} canNext={selected.length > 0} isLast={isLastStep} />
      </div>
    );
  }

  return null;
}

function NavRow({ onNext, onBack, canNext, isFirst, isLast }) {
  return (
    <div className="pico-nav-row">
      {!isFirst && (
        <button className="pico-back-btn" onClick={onBack} type="button">
          ← Back
        </button>
      )}
      <button
        className="btn-primary"
        onClick={onNext}
        disabled={!canNext}
        aria-disabled={!canNext}
        type="button"
      >
        {isLast ? 'Search with this question' : 'Continue'}
        {!isLast && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        )}
      </button>
    </div>
  );
}
