import { useState } from 'react';

export default function PathwayStep({ step, stepIndex, totalSteps, isFirst, onSelect, onBack, canGoBack, backward }) {
  const [selectedValue, setSelectedValue] = useState('');
  const [numberValue, setNumberValue] = useState('');

  function handleBranch(condition) {
    const branch = step.branches.find(b => b.condition === condition);
    if (!branch) return;
    onSelect(branch.nextStepId, condition, branch.outcomeMessage);
  }

  function handleNumberSubmit() {
    const val = parseFloat(numberValue);
    if (isNaN(val)) return;
    // Find matching branch by condition (e.g., ">7" or a default)
    const branch = step.branches.find(b => {
      if (b.condition === 'any' || b.condition === 'submit') return true;
      // Numeric comparisons
      if (b.condition.startsWith('>')) return val > parseFloat(b.condition.slice(1));
      if (b.condition.startsWith('<')) return val < parseFloat(b.condition.slice(1));
      if (b.condition.startsWith('>=')) return val >= parseFloat(b.condition.slice(2));
      if (b.condition.startsWith('<=')) return val <= parseFloat(b.condition.slice(2));
      return false;
    }) || step.branches[0];
    if (branch) onSelect(branch.nextStepId, numberValue, branch.outcomeMessage);
  }

  const animClass = backward ? 'pathway-step-card back-dir' : 'pathway-step-card';

  return (
    <div className={animClass}>
      {/* Progress dots */}
      <div className="pathway-dot-row" aria-hidden="true">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span key={i} className={`pathway-dot${i < stepIndex ? ' done' : i === stepIndex ? ' current' : ''}`} />
        ))}
      </div>

      <p className="pathway-step-num">Step {stepIndex + 1} of {totalSteps}</p>
      <h2 className="pathway-step-title">{step.title}</h2>
      <p className="pathway-step-question">{step.question}</p>

      {/* Disclaimer on step 0 only */}
      {isFirst && step.disclaimer && (
        <p className="pathway-disclaimer">{step.disclaimer}</p>
      )}

      {step.body && <div className="pathway-step-body">{step.body}</div>}

      {/* Input areas */}
      {!step.input && step.branches.length === 2 && (
        <div className="pathway-input-yesno">
          {step.branches.map(b => (
            <button
              key={b.condition}
              className="pathway-yesno-btn"
              onClick={() => handleBranch(b.condition)}
            >
              {b.condition === 'yes' ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      )}

      {step.input?.type === 'yesno' && (
        <div className="pathway-input-yesno">
          <button className="pathway-yesno-btn" onClick={() => handleBranch('yes')}>Yes</button>
          <button className="pathway-yesno-btn" onClick={() => handleBranch('no')}>No</button>
        </div>
      )}

      {step.input?.type === 'select' && (
        <div className="pathway-select-options">
          {step.input.options.map((opt, i) => {
            const branch = step.branches[i] || step.branches[0];
            return (
              <button
                key={opt}
                className={`pathway-select-opt${selectedValue === opt ? ' selected' : ''}`}
                onClick={() => {
                  setSelectedValue(opt);
                  if (branch) onSelect(branch.nextStepId, opt, branch.outcomeMessage);
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {step.input?.type === 'number' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="pathway-number-input">
            <input
              type="number"
              min={step.input.min}
              max={step.input.max}
              value={numberValue}
              onChange={e => setNumberValue(e.target.value)}
              placeholder={step.input.label || 'Enter value'}
              aria-label={step.input.label}
              onKeyDown={e => e.key === 'Enter' && handleNumberSubmit()}
            />
            {step.input.unit && <span className="unit">{step.input.unit}</span>}
          </div>
          <div className="pathway-step-nav">
            {canGoBack && (
              <button className="pathway-back" onClick={onBack} aria-label="Go to previous step">← Back</button>
            )}
            <button
              className="btn-primary"
              onClick={handleNumberSubmit}
              disabled={!numberValue}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Continue
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Back nav for non-number types */}
      {step.input?.type !== 'number' && canGoBack && (
        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-start' }}>
          <button className="pathway-back" onClick={onBack} aria-label="Go to previous step">← Back</button>
        </div>
      )}
    </div>
  );
}
