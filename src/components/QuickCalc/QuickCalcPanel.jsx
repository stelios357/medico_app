import { lazy, Suspense, useEffect, useRef } from 'react';
import { useQuickCalc } from '../../hooks/useQuickCalc.js';
import '../../styles/quickcalc.css';

const NNTCalc        = lazy(() => import('./calculators/NNTCalc.jsx'));
const RRCalc         = lazy(() => import('./calculators/RRCalc.jsx'));
const EffectSizeCalc = lazy(() => import('./calculators/EffectSizeCalc.jsx'));
const CICalc         = lazy(() => import('./calculators/CICalc.jsx'));
const GRADECalc      = lazy(() => import('./calculators/GRADECalc.jsx'));

const CALC_MAP = {
  NNT: NNTCalc,
  RR:  RRCalc,
  ES:  EffectSizeCalc,
  CI:  CICalc,
  GR:  GRADECalc,
};

const TAB_LABELS = {
  NNT: 'NNT',
  RR:  'RR',
  ES:  'ES',
  CI:  'CI',
  GR:  'GR',
};

function LoadingFallback() {
  return (
    <div className="qc-loading" aria-label="Loading calculator">
      <span className="qc-loading-dot" />
      <span className="qc-loading-dot" />
      <span className="qc-loading-dot" />
    </div>
  );
}

// Sigma SVG icon
function SigmaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 4H6l6 8-6 8h12" />
    </svg>
  );
}

export default function QuickCalcPanel() {
  const { open, toggle, close, activeTab, setActiveTab, tabs } = useQuickCalc();
  const panelRef = useRef(null);

  // Escape key closes panel
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Trap focus within panel when open (a11y)
  useEffect(() => {
    if (open && panelRef.current) {
      // Give React a tick to render the panel before focusing
      const id = setTimeout(() => {
        const firstFocusable = panelRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  const ActiveCalc = CALC_MAP[activeTab] ?? NNTCalc;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="qc-backdrop"
          aria-hidden="true"
          onClick={close}
        />
      )}

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="qc-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Quick Calculator"
        >
          {/* Panel header */}
          <div className="qc-panel-header">
            <div className="qc-panel-title">
              <span className="qc-panel-title-icon" aria-hidden="true">Σ</span>
              Quick Calc
            </div>
            <button
              className="qc-panel-close"
              onClick={close}
              aria-label="Close Quick Calc"
              type="button"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Tab bar */}
          <div className="qc-tabs" role="tablist" aria-label="Calculator tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={'qc-tab' + (activeTab === tab ? ' active' : '')}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          {/* Calculator content */}
          <Suspense fallback={<LoadingFallback />}>
            <ActiveCalc />
          </Suspense>
        </div>
      )}

      {/* FAB */}
      <button
        className={'qc-fab' + (open ? ' open' : '')}
        onClick={toggle}
        aria-label={open ? 'Close Quick Calc' : 'Open Quick Calc'}
        aria-expanded={open}
        aria-controls="qc-panel"
        type="button"
      >
        <SigmaIcon />
      </button>
    </>
  );
}
