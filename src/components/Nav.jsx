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
          <a href="#features" onClick={(e) => handleAnchorClick(e, 'features')} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
            Features
          </a>
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
