import { Link } from 'react-router-dom';
import { IAP_COUNT } from '../data/iapGuidelines.js';

export default function Footer() {
  return (
    <footer>
      <div className="footer-logo">Pause<span>MD</span></div>
      <p>Built by doctors who know what it's like to blank during rounds. Grounded in IAP, AIIMS, and WHO protocols. Made for Indian PG residents.</p>
      <ul className="footer-links">
        <li><a href="#protocols">Protocol Search</a></li>
        <li><Link to="/calc" style={{ color: '#F0F4F8', textDecoration: 'none' }}>Dose Calculator</Link></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#waitlist">Join Waitlist</a></li>
      </ul>
      <p className="footer-mono">© 2026 PauseMD · {IAP_COUNT} IAP protocols · Pediatric Dose Calculator · India</p>
    </footer>
  );
}
