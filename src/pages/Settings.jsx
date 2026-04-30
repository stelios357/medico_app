import Nav from '../components/Nav.jsx';
import ThemePicker from '../components/ThemePicker/ThemePicker.jsx';
import SpecialtyPicker from '../components/Onboarding/SpecialtyPicker.jsx';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Settings() {
  const [specialties, setSpecialties] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pausemd_specialties') || '[]'); }
    catch { return []; }
  });

  function saveSpecialties(next) {
    setSpecialties(next);
    localStorage.setItem('pausemd_specialties', JSON.stringify(next));
  }

  function resetOnboarding() {
    localStorage.removeItem('pausemd_onboarded');
    localStorage.removeItem('pausemd_specialties');
    window.location.reload();
  }

  return (
    <div className="settings-page">
      <Nav />
      <div className="settings-inner">
        <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.5rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </Link>

        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', marginBottom: '2rem' }}>Settings</h1>

        <div className="settings-section">
          <p className="settings-section-title">Appearance</p>
          <ThemePicker />
        </div>

        <div className="settings-section">
          <p className="settings-section-title">My specialties</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Used to surface the most relevant evidence first.
          </p>
          <SpecialtyPicker selected={specialties} onChange={saveSpecialties} />
        </div>

        <div className="settings-section">
          <p className="settings-section-title">Data</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/saved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--teal)', fontFamily: 'var(--mono)', fontSize: '0.82rem', textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
              View saved studies
            </Link>
            <button
              className="drug-action-btn"
              style={{ width: 'fit-content' }}
              onClick={resetOnboarding}
            >
              Reset onboarding
            </button>
          </div>
        </div>

        <div className="settings-section">
          <p className="settings-section-title">About</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            PauseMD presents summaries of published systematic reviews and meta-analyses.
            It does not provide clinical diagnosis or personalized treatment advice.
            Evidence quality ratings are based on the GRADE framework.
          </p>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.75rem' }}>
            v1.0.0 · PauseMD
          </p>
        </div>
      </div>
    </div>
  );
}
