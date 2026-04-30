import { useState, useEffect } from 'react';
import { usePico } from '../../hooks/usePico.js';
import PICOStepForm from './PICOStepForm.jsx';

const TOTAL_STEPS = 4;

export default function PICOBuilder({ onClose }) {
  const { setPico, pico } = usePico();
  const [step, setStep] = useState(0);
  const [showReview, setShowReview] = useState(false);

  const [population, setPopulation] = useState(pico?.population || '');
  const [intervention, setIntervention] = useState(pico?.intervention || '');
  const [comparator, setComparator] = useState(pico?.comparator || '');
  const [outcome, setOutcome] = useState(pico?.outcome || []);

  const hasFilled = population || intervention || comparator || (Array.isArray(outcome) && outcome.length > 0);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        if (hasFilled) {
          if (window.confirm('You have unsaved PICO data. Close anyway?')) onClose();
        } else {
          onClose();
        }
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [hasFilled, onClose]);

  function handleNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
    } else {
      setShowReview(true);
    }
  }

  function handleBack() {
    if (showReview) {
      setShowReview(false);
    } else {
      setStep(s => Math.max(0, s - 1));
    }
  }

  function handleSubmit() {
    setPico({ population, intervention, comparator, outcome });
    onClose();
  }

  const VALUES = [population, intervention, comparator, outcome];
  const SETTERS = [setPopulation, setIntervention, setComparator, setOutcome];

  const outcomeText = Array.isArray(outcome) ? outcome.join(', ') : outcome;

  const picoSentence = `In ${population || '[population]'}, does ${intervention || '[intervention]'} compared to ${comparator || '[comparator]'} improve ${outcomeText || '[outcome]'}?`;

  return (
    <div className="pico-overlay" role="dialog" aria-modal="true" aria-label="Define your clinical question">
      <div className="pico-panel">
        <div className="pico-panel-head">
          <span className="pico-panel-title">Define your PICO question</span>
          <button className="pico-close" onClick={onClose} aria-label="Close PICO builder">×</button>
        </div>

        {!showReview ? (
          <PICOStepForm
            step={step}
            value={VALUES[step]}
            onChange={SETTERS[step]}
            onNext={handleNext}
            onBack={handleBack}
            isLastStep={step === TOTAL_STEPS - 1}
          />
        ) : (
          <div className="pico-step">
            <p className="pico-step-label" style={{ textAlign: 'center' }}>Review your question</p>
            <div className="pico-review-box">
              <p className="pico-q">
                In <em>{population}</em>, does <em>{intervention}</em> compared to <em>{comparator}</em> improve <em>{outcomeText}</em>?
              </p>
            </div>
            <div className="pico-nav-row">
              <button className="pico-back-btn" onClick={handleBack} type="button">
                ← Edit
              </button>
              <button className="btn-primary" onClick={handleSubmit} type="button" style={{ flex: 1, justifyContent: 'center' }}>
                Search with this question
              </button>
            </div>
          </div>
        )}

        {/* Step indicator */}
        {!showReview && (
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i === step ? 'var(--teal)' : 'var(--border)',
                  display: 'inline-block',
                  transition: 'background 0.2s',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
