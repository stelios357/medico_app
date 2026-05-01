import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import { calculatorRegistry } from '../data/calculatorRegistry.js';
import { useCalcHistory } from '../hooks/useCalcHistory.js';
import '../styles/calculators.css';

const SPECIALTY_ORDER = ['All', 'Cardiology', 'Nephrology', 'Neurology', 'Emergency', 'OB/GYN', 'Pulmonology', 'General'];

function buildTabs() {
  const inRegistry = new Set(calculatorRegistry.map(c => {
    const s = c.specialty;
    return s === 'obgyn' ? 'OB/GYN' : s.charAt(0).toUpperCase() + s.slice(1);
  }));
  return SPECIALTY_ORDER.filter(t => t === 'All' || inRegistry.has(t));
}

function specialtyLabel(raw) {
  if (!raw) return '';
  if (raw === 'obgyn') return 'OB/GYN';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

const TABS = buildTabs();

export default function Calculators() {
  const [activeTab, setActiveTab] = useState('All');
  const { history } = useCalcHistory();

  const filtered = useMemo(() => {
    if (activeTab === 'All') return calculatorRegistry;
    return calculatorRegistry.filter(c => specialtyLabel(c.specialty) === activeTab);
  }, [activeTab]);

  const recentThree = history.slice(0, 3);

  return (
    <>
      <Nav />
      <main className="calcs-page">
        <div className="calcs-header">
          <div className="calcs-header-inner">
            <Link to="/" className="calcs-back-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
              Back to search
            </Link>
            <h1 className="calcs-title">Clinical Calculators</h1>
            <p className="calcs-subtitle">{calculatorRegistry.length} calculators — specialty-specific scoring tools and clinical equations</p>
          </div>
        </div>

        <div className="calcs-tabs" role="tablist" aria-label="Filter by specialty">
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`calcs-tab${activeTab === tab ? ' calcs-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="calcs-container">
          {recentThree.length > 0 && activeTab === 'All' && (
            <section className="calcs-recent">
              <p className="calcs-section-title">Recently Used</p>
              <div className="calcs-recent-list">
                {recentThree.map((entry, i) => (
                  <Link
                    key={`${entry.slug}-${i}`}
                    to={`/calculator/${entry.slug}`}
                    className="calcs-recent-chip"
                  >
                    <span className="calcs-recent-name">{entry.name}</span>
                    <span className="calcs-recent-result">
                      {entry.result}{entry.unit ? ` ${entry.unit}` : ''} — {entry.interpretation.split('—')[0].trim()}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {filtered.length === 0 ? (
            <p className="calcs-empty">No calculators available for this specialty yet.</p>
          ) : (
            <>
              <p className="calcs-section-title">
                {activeTab === 'All' ? 'All calculators' : activeTab}
              </p>
              <div className="calcs-grid">
                {filtered.map(calc => (
                  <Link key={calc.slug} to={`/calculator/${calc.slug}`} className="calcs-card">
                    <div className="calcs-card-top">
                      <h2 className="calcs-card-name">{calc.name}</h2>
                      <span className="calcs-card-specialty">{specialtyLabel(calc.specialty)}</span>
                    </div>
                    <p className="calcs-card-desc">{calc.description}</p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
