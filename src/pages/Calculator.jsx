import { useState, useEffect, useCallback, useRef } from 'react';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import WeightInput from '../components/DoseCalc/WeightInput.jsx';
import DrugCard from '../components/DoseCalc/DrugCard.jsx';
import EquipmentPanel from '../components/DoseCalc/EquipmentPanel.jsx';
import NormalValues from '../components/DoseCalc/NormalValues.jsx';
import { DRUGS, calcDrug } from '../components/DoseCalc/drugsData.js';
import '../styles/calc.css';

const TABS = [
  { id: 'resus',    label: 'Resus',       icon: <HeartIcon />,    color: 'var(--red)' },
  { id: 'seizure',  label: 'Seizure',     icon: <BrainIcon />,    color: '#9B59B6' },
  { id: 'rsi',      label: 'RSI',         icon: <AirwayIcon />,   color: 'var(--amber)' },
  { id: 'sedation', label: 'Sedation',    icon: <MoonIcon />,     color: '#3498DB' },
  { id: 'fluids',   label: 'Fluids',      icon: <DropletIcon />,  color: 'var(--teal)' },
  { id: 'equipment',label: 'Equipment',   icon: <RulerIcon />,    color: 'var(--muted)' },
];

const LS_PINNED_KEY = 'pausemd_pinned_drugs';
const LS_DISCLAIMER_KEY = 'pausemd_disclaimer_dismissed';

export default function Calculator() {
  const [weight, setWeight] = useState(20);
  const [activeTab, setActiveTab] = useState('resus');
  const [searchQuery, setSearchQuery] = useState('');
  const [pinned, setPinned] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_PINNED_KEY) || '[]'); }
    catch { return []; }
  });
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(
    () => localStorage.getItem(LS_DISCLAIMER_KEY) === 'true'
  );
  const [copyAllDone, setCopyAllDone] = useState(false);

  // Update document title / meta
  useEffect(() => {
    document.title = 'Pediatric Emergency Dose Calculator — PauseMD';
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      'Instant pediatric drug dose calculator for Indian residents. Enter weight, get doses for all emergency drugs. Based on IAP/PALS 2020 guidelines.'
    );
  }, []);

  // Persist pins
  useEffect(() => {
    localStorage.setItem(LS_PINNED_KEY, JSON.stringify(pinned));
  }, [pinned]);

  // Emergency mode: try Wake Lock API
  useEffect(() => {
    let wakeLock = null;
    if (emergencyMode && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen')
        .then(lock => { wakeLock = lock; })
        .catch(() => {});
    }
    return () => { if (wakeLock) wakeLock.release(); };
  }, [emergencyMode]);

  function togglePin(id) {
    setPinned(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  function dismissDisclaimer() {
    localStorage.setItem(LS_DISCLAIMER_KEY, 'true');
    setDisclaimerDismissed(true);
  }

  // Debounced weight change
  const debounceRef = useRef(null);
  const handleWeightChange = useCallback((w) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setWeight(w), 80);
    setWeight(w); // immediate for UI responsiveness
  }, []);

  // Drug filtering
  const drugsForTab = searchQuery.trim()
    ? DRUGS.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.indication.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : DRUGS.filter(d => d.category === activeTab);

  const pinnedDrugs = DRUGS.filter(d => pinned.includes(d.id));

  // Only show RESUS + SEIZURE in emergency mode
  const visibleTabs = emergencyMode
    ? TABS.filter(t => t.id === 'resus' || t.id === 'seizure')
    : TABS;

  // Copy all doses
  function handleCopyAll() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const lines = ['PauseMD — Emergency Doses for ' + weight + ' kg patient', '—'.repeat(48)];
    const byCategory = {};
    DRUGS.forEach(d => {
      if (!byCategory[d.category]) byCategory[d.category] = [];
      byCategory[d.category].push(d);
    });

    Object.entries(byCategory).forEach(([cat, drugs]) => {
      lines.push('');
      lines.push(cat.toUpperCase() + ':');
      drugs.forEach(drug => {
        const result = calcDrug(drug, weight);
        if (!result) return;
        const vol = result.volumeLabel ? ` (${result.volumeLabel} of ${result.concentrationLabel || ''})` : '';
        lines.push(`  • ${drug.name} [${drug.indication}]: ${result.displayDose}${vol}`);
      });
    });

    lines.push('');
    lines.push(`Generated: ${timeStr} IST · PauseMD`);

    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopyAllDone(true);
      setTimeout(() => setCopyAllDone(false), 2000);
    });
  }

  const pageClass = `calc-page${emergencyMode ? ' emergency-mode' : ''}`;

  return (
    <div className={pageClass}>
      <Nav />
      <div className="calc-page-inner">

        {/* Disclaimer */}
        {!disclaimerDismissed && (
          <div className="disclaimer-banner">
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <div className="disclaimer-text">
              <strong>Clinical Decision Support Tool</strong> — Doses are calculated per IAP/PALS 2020 guidelines.
              Always verify doses before administration. Maximum doses are enforced.
              PauseMD does not replace clinical judgment.
            </div>
            <button className="disclaimer-dismiss" onClick={dismissDisclaimer} aria-label="Dismiss disclaimer">✕</button>
          </div>
        )}

        {/* Page header */}
        <div className="calc-header">
          <div className="calc-header-text">
            <div className="calc-header-badge">Emergency Dose Calculator</div>
            <h1>Weight in. Doses out.</h1>
            <p className="calc-header-sub">
              All doses based on IAP / PALS 2020 guidelines. Always verify before administering.
            </p>
          </div>
          <div className="emergency-toggle-wrap">
            <button
              className={`emergency-toggle${emergencyMode ? ' active' : ''}`}
              onClick={() => setEmergencyMode(v => !v)}
              aria-pressed={emergencyMode}
            >
              <span className="emergency-dot" />
              Emergency Mode
            </button>
            <span className="emerg-label">{emergencyMode ? 'Active — screen stays on' : 'Tap for bedside view'}</span>
          </div>
        </div>

        {/* Normal Values */}
        <NormalValues weight={weight} />

        {/* Weight input */}
        <WeightInput weight={weight} onChange={handleWeightChange} />

        {/* Copy all */}
        <div className="copy-all-bar">
          <span>All {DRUGS.length} drug doses calculated for {weight} kg patient</span>
          <button className="copy-all-btn" onClick={handleCopyAll}>
            {copyAllDone ? '✓ Copied!' : '📋 Copy All Doses'}
          </button>
        </div>

        {/* Pinned drugs */}
        {pinnedDrugs.length > 0 && (
          <div className="pinned-section">
            <div className="pinned-section-header">📌 My Quick Calc ({pinnedDrugs.length})</div>
            <div className="drugs-grid">
              {pinnedDrugs.map(drug => (
                <DrugCard
                  key={drug.id}
                  drug={drug}
                  weight={weight}
                  pinned={pinned.includes(drug.id)}
                  onPin={togglePin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Drug search */}
        <div className="search-bar-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="drug-search-input"
            placeholder='Search a drug — e.g. "midaz", "ketamine", "adrenaline"…'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search drugs"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">✕</button>
          )}
        </div>

        {/* Category tabs */}
        {!searchQuery && (
          <div className="calc-tabs-bar" role="tablist">
            {visibleTabs.map(tab => (
              <button
                key={tab.id}
                className={`calc-tab${activeTab === tab.id ? ' active' : ''}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Equipment panel */}
        {!searchQuery && activeTab === 'equipment' ? (
          <EquipmentPanel weight={weight} />
        ) : (
          <div className="drugs-grid">
            {drugsForTab.length === 0 ? (
              <div className="drugs-empty">
                <strong>No drugs found for "{searchQuery}"</strong>
                Try "adrenaline", "midazolam", or "ketamine"
              </div>
            ) : (
              drugsForTab.map(drug => (
                <DrugCard
                  key={drug.id}
                  drug={drug}
                  weight={weight}
                  pinned={pinned.includes(drug.id)}
                  onPin={togglePin}
                />
              ))
            )}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}

// ── Tab icons ────────────────────────────────────────────────────────────────
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.4 2.1-1.1 2.8A4 4 0 0 1 18 12a4 4 0 0 1-2 3.46V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1.54A4 4 0 0 1 6 12a4 4 0 0 1 3.1-3.2A4 4 0 0 1 8 6a4 4 0 0 1 4-4z"/>
    </svg>
  );
}

function AirwayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 15.89 15.89 21.3a2.98 2.98 0 0 1-4.22 0L2.7 12.33a2.98 2.98 0 0 1 0-4.22L8.11 2.7a2.98 2.98 0 0 1 4.22 0l8.97 8.97a2.98 2.98 0 0 1 0 4.22z"/>
      <path d="m7.5 10.5 3 3M10.5 7.5l3 3M13.5 4.5l3 3"/>
    </svg>
  );
}
