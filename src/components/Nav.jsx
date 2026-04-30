import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCalc = location.pathname === '/calc';

  function handleAnchorClick(e, anchor) {
    e.preventDefault();
    if (isCalc) {
      navigate('/');
      // Let the page load then scroll
      setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <nav>
      <Link to="/" className="logo">
        <svg className="logo-mark" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="12" width="8" height="8" rx="2" fill="#D94F4F" opacity="0.7"/>
          <rect x="12" y="4" width="8" height="24" rx="2" fill="#D94F4F"/>
          <rect x="22" y="14" width="8" height="4" rx="2" fill="#D94F4F" opacity="0.7"/>
        </svg>
        <span className="logo-text">Pause<span>MD</span></span>
      </Link>

      <ul className="nav-links">
        <li>
          <a href="#protocols" className="nav-live" onClick={(e) => handleAnchorClick(e, 'protocols')}>
            <span className="nav-live-dot" />Protocols
          </a>
        </li>
        <li>
          <Link to="/calc" className="nav-calc-link" style={{ color: 'var(--teal)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
            Dose Calc<span className="nav-calc-badge">LIVE</span>
          </Link>
        </li>
        <li>
          <Link to="/saved" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            Saved
          </Link>
        </li>
        <li>
          <Link to="/settings" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            Settings
          </Link>
        </li>
        <li>
          <a href="#waitlist" className="nav-cta" onClick={(e) => handleAnchorClick(e, 'waitlist')}>
            Join Waitlist
          </a>
        </li>
      </ul>
    </nav>
  );
}
