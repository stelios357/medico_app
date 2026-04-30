import { useState, useEffect } from 'react';
import { usePathway } from '../../hooks/usePathway.js';
import PathwayStep from './PathwayStep.jsx';
import PathwayOutcome from './PathwayOutcome.jsx';

export default function PathwayViewer({ pathway, onClose }) {
  const { currentStep, stepIndex, totalSteps, canGoBack, goTo, goBack, restart } = usePathway(pathway);
  const [outcomeInfo, setOutcomeInfo] = useState(null);
  const [backward, setBackward] = useState(false);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleSelect(nextStepId, answer, outcomeMessage) {
    const isOutcome = nextStepId.startsWith('outcome_');
    setBackward(false);
    if (isOutcome) {
      setOutcomeInfo({ type: nextStepId, message: outcomeMessage });
    } else {
      goTo(nextStepId, answer);
    }
  }

  function handleBack() {
    setBackward(true);
    setOutcomeInfo(null);
    goBack();
  }

  function handleRestart() {
    setBackward(false);
    setOutcomeInfo(null);
    restart();
  }

  return (
    <div className="pathway-overlay" role="dialog" aria-modal="true" aria-label={pathway.title}>
      <div className="pathway-header">
        <div>
          <p className="pathway-header-meta">Clinical Pathway</p>
          <h1 className="pathway-header-title">{pathway.title}</h1>
        </div>
        <div className="pathway-header-right">
          {!outcomeInfo && (
            <span className="pathway-progress">
              Step {stepIndex + 1} / {totalSteps}
            </span>
          )}
          <button
            className="pathway-restart"
            onClick={handleRestart}
            aria-label="Restart pathway"
            title="Start over from step 1"
          >
            ↺ Restart
          </button>
          <button className="pathway-close" onClick={onClose} aria-label="Close pathway">
            Close ×
          </button>
        </div>
      </div>

      <div className="pathway-body">
        {outcomeInfo ? (
          <PathwayOutcome
            type={outcomeInfo.type}
            message={outcomeInfo.message}
            onRestart={handleRestart}
          />
        ) : currentStep ? (
          <PathwayStep
            step={currentStep}
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            isFirst={stepIndex === 0}
            onSelect={handleSelect}
            onBack={handleBack}
            canGoBack={canGoBack}
            backward={backward}
          />
        ) : (
          <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Pathway not found.</p>
        )}
      </div>

      {/* Disclaimer footer */}
      <div style={{
        padding: '0.75rem 2rem',
        borderTop: '1px solid var(--border)',
        fontSize: '0.72rem',
        color: 'var(--muted)',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        {pathway.disclaimer} Always apply clinical judgment.
      </div>
    </div>
  );
}
