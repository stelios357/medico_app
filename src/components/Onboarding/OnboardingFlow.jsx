import { useState, useEffect, useRef } from 'react';
import SpecialtyPicker from './SpecialtyPicker.jsx';

const TOTAL_SCREENS = 3;

export default function OnboardingFlow({ onComplete }) {
  const [screen, setScreen] = useState(0);
  const [specialties, setSpecialties] = useState([]);
  const [agreed, setAgreed] = useState(false);
  const [direction, setDirection] = useState('forward');
  const containerRef = useRef(null);

  // Apply slide animation direction
  const animClass = direction === 'forward' ? 'ob-slide-in' : 'ob-slide-in-back';

  function next() {
    setDirection('forward');
    setScreen(s => s + 1);
  }

  function handleFinish() {
    onComplete(specialties);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') return; // do not close onboarding
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dots = (
    <div className="ob-dots" role="progressbar" aria-valuenow={screen + 1} aria-valuemax={TOTAL_SCREENS} aria-valuemin={1} aria-label={`Step ${screen + 1} of ${TOTAL_SCREENS}`}>
      {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
        <span key={i} className={`ob-dot${i === screen ? ' active' : ''}`} />
      ))}
    </div>
  );

  return (
    <div className="ob-overlay" role="dialog" aria-modal="true" aria-label="Welcome to PauseMD">
      <div className="ob-panel" ref={containerRef}>
        <div className={`ob-screen ${animClass}`} key={screen}>
          {screen === 0 && (
            <div className="ob-content">
              <div className="ob-logo-mark" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="18" width="12" height="12" rx="3" fill="var(--red)" opacity="0.7"/>
                  <rect x="18" y="6" width="12" height="36" rx="3" fill="var(--red)"/>
                  <rect x="33" y="21" width="12" height="6" rx="3" fill="var(--red)" opacity="0.7"/>
                </svg>
              </div>
              <h1 className="ob-headline">Evidence at your<br/><em>fingertips</em></h1>
              <p className="ob-sub">PauseMD summarizes systematic reviews so you can pause, check, and decide — without hunting through PDFs during a busy ward round.</p>
              <button className="btn-primary ob-btn" onClick={next} autoFocus>
                Get started
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}

          {screen === 1 && (
            <div className="ob-content">
              <h2 className="ob-headline ob-headline--sm">What's your primary specialty?</h2>
              <p className="ob-sub">This helps us surface the most relevant evidence first. You can change this anytime in Settings.</p>
              <SpecialtyPicker selected={specialties} onChange={setSpecialties} />
              <button
                className="btn-primary ob-btn"
                onClick={next}
                disabled={specialties.length === 0}
                aria-disabled={specialties.length === 0}
              >
                Continue
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}

          {screen === 2 && (
            <div className="ob-content">
              <h2 className="ob-headline ob-headline--sm">A note on using this app</h2>
              <div className="ob-disclaimer-body">
                <p>PauseMD presents summaries of published systematic reviews and meta-analyses. It does not provide clinical diagnosis or personalized treatment advice.</p>
                <p>Always apply your clinical judgment and consult primary sources before making decisions. Evidence quality ratings are based on the GRADE framework.</p>
              </div>
              <label className="ob-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  aria-label="I understand this is a reference tool, not a clinical decision-making system"
                />
                <span className="ob-checkbox-text">I understand this is a reference tool, not a clinical decision-making system</span>
              </label>
              <button
                className="btn-primary ob-btn"
                onClick={handleFinish}
                disabled={!agreed}
                aria-disabled={!agreed}
              >
                Start exploring
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}
        </div>
        {dots}
      </div>
    </div>
  );
}
