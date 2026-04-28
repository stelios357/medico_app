import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import WeightInput from '../components/DoseCalc/WeightInput.jsx';
import DrugCard from '../components/DoseCalc/DrugCard.jsx';
import { DRUGS } from '../components/DoseCalc/drugsData.js';
import { IAP_GUIDELINES, IAP_COUNT, POPULAR_SEARCHES } from '../data/iapGuidelines.js';

// ── Fuzzy search engine ──────────────────────────────────────────────────────
function editDist(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i-1] === b[j-1] ? prev[j-1] : 1 + Math.min(prev[j], curr[j-1], prev[j-1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function norm(s) { return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim(); }

function scoreMatch(query, g) {
  const q = norm(query);
  if (!q) return 0;
  const name = norm(g[1]);
  const allText = name + ' ' + norm(g[2]);
  if (name.includes(q)) return 150;
  if (allText.includes(q)) return 110;
  const qWords = q.split(' ').filter(w => w.length >= 2);
  if (qWords.length === 0) return 0;
  const tWords = allText.split(' ').filter(w => w.length >= 2);
  let total = 0, matched = 0;
  for (const qw of qWords) {
    let best = 0;
    for (const tw of tWords) {
      if (tw === qw) { best = Math.max(best, 60); continue; }
      if (tw.startsWith(qw) || qw.startsWith(tw)) { best = Math.max(best, 40); continue; }
      if (tw.includes(qw) || qw.includes(tw)) { best = Math.max(best, 30); continue; }
      if (qw.length >= 4 && tw.length >= 4) {
        const d = editDist(qw, tw);
        if (d === 1) best = Math.max(best, 28);
        else if (d === 2 && qw.length >= 5) best = Math.max(best, 10);
      }
    }
    if (best > 0) matched++;
    total += best;
  }
  if (matched === qWords.length && qWords.length > 0) total = Math.round(total * 1.5);
  return total;
}

function searchGuidelines(query) {
  if (!query.trim()) return [];
  return IAP_GUIDELINES
    .map(g => ({ g, score: scoreMatch(query, g) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(r => r.g);
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightMatch(text, query) {
  const q = norm(query).trim();
  if (!q || q.length < 2) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try { return escaped.replace(new RegExp('(' + safeQ + ')', 'gi'), '<mark>$1</mark>'); }
  catch { return escaped; }
}

// ── Reveal animation hook ────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── Counter animation hook ───────────────────────────────────────────────────
function useCounter(target, running) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!running) return;
    let count = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      setVal(count);
      if (count >= target) clearInterval(timer);
    }, 35);
    return () => clearInterval(timer);
  }, [running, target]);
  return val;
}

// ── Story panel data ─────────────────────────────────────────────────────────
const STORY_STAGES = [
  {
    stage: 1,
    label: 'Stage one', title: 'Chaos hits',
    panel: {
      head: 'Right now. Ward 4B.',
      title: <><em>The longest</em><br />5 minutes of your life.</>,
      lines: ['3 AM. Consultant on the way. Nurse looking at you. Parent crying. You blank on the dose.'],
      chips: [
        { label: 'HARD ROUNDS!!', type: 'warn' },
        { label: '7 kg · dose?', type: 'amber' },
        { label: 'Google → 14 tabs', type: '' },
      ],
      meter: { label: 'Stress level', value: '95%', pct: 95, color: 'var(--red)' },
    },
  },
  {
    stage: 2,
    label: 'Stage two', title: 'Critical decision',
    panel: {
      head: 'The critical moment.',
      title: <>You need the answer<br /><em>right now.</em></>,
      lines: ['Dengue Group B. Critical phase. The consultant asks: "What\'s the fluid rate?" You need the IAP protocol. Now.'],
      chips: [
        { label: 'IAP Ch.138', type: 'teal' },
        { label: 'HCT ≥20% rise', type: 'warn' },
        { label: 'Critical phase', type: 'amber' },
      ],
      meter: { label: 'Time to answer', value: '8s', pct: 70, color: 'var(--amber)' },
    },
  },
  {
    stage: 3,
    label: 'Stage three', title: 'We got you',
    panel: {
      head: 'PauseMD. 2 taps.',
      title: <><em>Confident</em><br />answer in hand.</>,
      lines: ['Type "dengue". Get Ch.138 instantly. See the exact fluid rate. Say it out loud. Nailed it.'],
      chips: [
        { label: '5–7 mL/kg/hr', type: 'teal' },
        { label: 'IAP STG 2022', type: 'teal' },
        { label: 'Verified ✓', type: 'teal' },
      ],
      meter: { label: 'Confidence', value: '100%', pct: 18, color: 'var(--teal)' },
    },
  },
];

// ── Teaser drugs ─────────────────────────────────────────────────────────────
const TEASER_DRUG_IDS = ['adrenaline_arrest', 'diazepam_iv', 'fluid_bolus_10'];
const teaserDrugs = DRUGS.filter(d => TEASER_DRUG_IDS.includes(d.id));

// ── Main component ───────────────────────────────────────────────────────────
export default function Landing() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeStage, setActiveStage] = useState(1);
  const [statsVisible, setStatsVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [teaserWeight, setTeaserWeight] = useState(20);

  // Update title/meta
  useEffect(() => {
    document.title = 'PauseMD — Your Pocket SR';
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      `Search ${IAP_COUNT} IAP Standard Treatment Guidelines instantly. Pediatric emergency dose calculator. PauseMD is the clinical sidekick for Indian PG residents.`
    );
    document.documentElement.classList.add('js');
  }, []);

  // Search debounce
  const searchTimer = useRef(null);
  function handleSearch(q) {
    setQuery(q);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setResults(q.trim() ? searchGuidelines(q) : []);
    }, 110);
  }

  // Stats counter observer
  const statsRef = useRef(null);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setStatsVisible(true); obs.disconnect(); }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const c1 = useCounter(IAP_COUNT, statsVisible);
  const c2 = useCounter(90, statsVisible);
  const c3 = useCounter(7, statsVisible);

  // Source card animation
  const sourceRef = useRef(null);
  useEffect(() => {
    const el = sourceRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('.source-card');
    cards.forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(16px)';
      c.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
    });
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        cards.forEach(c => {
          c.style.opacity = c.classList.contains('source-card--dim') ? '0.5' : '1';
          c.style.transform = 'translateY(0)';
        });
        obs.disconnect();
      }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Waitlist form
  async function handleWaitlist(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch('https://formspree.io/f/xpqkkppe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      // ignore — form still shows
    }
  }

  // Reveal refs
  const r = Array.from({ length: 20 }, () => useReveal());

  return (
    <>
      <Nav />

      {/* ── HERO ── */}
      <div className="hero">
        <svg className="ecg-bg" viewBox="0 0 1440 400" preserveAspectRatio="none">
          <path className="ecg-line" d="M0,200 L80,200 L100,200 L115,100 L130,300 L145,200 L200,200 L280,200 L300,200 L315,100 L330,300 L345,200 L400,200 L480,200 L500,200 L515,100 L530,300 L545,200 L600,200 L680,200 L700,200 L715,100 L730,300 L745,200 L800,200 L880,200 L900,200 L915,100 L930,300 L945,200 L1000,200 L1080,200 L1100,200 L1115,100 L1130,300 L1145,200 L1200,200 L1280,200 L1300,200 L1315,100 L1330,300 L1345,200 L1440,200" />
        </svg>

        <div className="hero-badge">
          <span className="badge-dot" />
          LIVE — {IAP_COUNT} PROTOCOLS + DOSE CALCULATOR
        </div>

        <h1>The protocol is<br /><em>already in your pocket.</em></h1>

        <p className="hero-sub">
          Type any disease, symptom, or keyword. Get the IAP Standard Treatment Guideline — <strong>instantly. No login. No PDF scavenger hunt.</strong> Built for Indian PG residents doing their 9th Google search of the shift.
        </p>

        <div className="hero-actions">
          <a href="#protocols" className="btn-primary" onClick={e => { e.preventDefault(); document.getElementById('protocols')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search {IAP_COUNT} IAP Protocols
          </a>
          <Link to="/calc" className="btn-primary" style={{ background: 'transparent', border: '1.5px solid var(--teal)', color: 'var(--teal)' }}>
            ⚡ Emergency Dose Calc
          </Link>
          <a href="#waitlist" className="btn-secondary" onClick={e => { e.preventDefault(); document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' }); }}>
            Get notified when the app launches →
          </a>
        </div>

        <p className="hero-note">FREE · No signup · IAP STG 2022 · Pediatrics · {IAP_COUNT} guidelines</p>
      </div>

      {/* ── SEARCH ── */}
      <div className="search-section" id="protocols">
        <div className="search-inner">
          <div className="search-header reveal" ref={r[0]}>
            <div className="section-tag no-line" style={{ justifyContent: 'center' }}>
              <span style={{ width: 6, height: 6, background: 'var(--teal)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
              Live · Working now
            </div>
            <h2>{IAP_COUNT} IAP guidelines.<br /><em>Zero PDF hunting.</em></h2>
            <div className="search-meta">
              <span><span className="search-meta-dot" />{IAP_COUNT} STGs indexed</span>
              <span>·</span><span>Fuzzy search — handles typos</span>
              <span>·</span><span>Direct PDF access</span>
              <span>·</span><span>IAP 2022</span>
            </div>
          </div>

          <div className="search-box reveal" ref={r[1]}>
            <svg className="search-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              className="search-input"
              placeholder="Type a disease, symptom, or keyword — e.g. cough, dengue, febrile seizure…"
              autoComplete="off"
              spellCheck="false"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              aria-label="Search IAP Standard Treatment Guidelines"
            />
          </div>

          <div className="search-results">
            {!query.trim() ? (
              <div className="search-chips">
                <div className="search-popular-label" style={{ width: '100%', marginBottom: '0.5rem' }}>Quick access — tap to search</div>
                {POPULAR_SEARCHES.map(p => (
                  <button key={p} className="search-chip" onClick={() => handleSearch(p)}>{p}</button>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="search-no-results">
                <p>No results for <strong>"{escapeHtml(query)}"</strong><br />
                Try a shorter term or synonym — e.g. "fits" for seizures.</p>
              </div>
            ) : (
              results.map(g => (
                <a key={g[0]} className="search-result-item" href={g[3]} target="_blank" rel="noopener noreferrer">
                  <span className="result-ch">Ch.{g[0]}</span>
                  <span className="result-name" dangerouslySetInnerHTML={{ __html: highlightMatch(g[1], query) }} />
                  <span className="result-open">Open PDF ↗</span>
                </a>
              ))
            )}
          </div>

          <p className="search-source-note">
            Source: Indian Academy of Pediatrics · Standard Treatment Guidelines 2022 ·{' '}
            <a href="https://iapindia.org/standard-treatment-guidelines/" target="_blank" rel="noopener">iapindia.org</a>
          </p>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="stats-bar" ref={statsRef}>
        <div className="stats-inner">
          <div className="stat-item">
            <span className="stat-num">{c1}</span>
            <span className="stat-label">IAP protocols<br />searchable right now</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{c2}%</span>
            <span className="stat-label">% of residents feel anxious<br />before rounds</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{c3}–8</span>
            <span className="stat-label">Google searches per duty<br />just to find protocols</span>
          </div>
          <div className="stat-item">
            <span className="stat-num" style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem' }}>₹0</span>
            <span className="stat-label">India-specific resident<br />apps that actually help</span>
          </div>
        </div>
      </div>

      {/* ── PROBLEM / STORYBOARD ── */}
      <div className="problem-section" id="problem">
        <div className="problem-inner">
          <div className="section-tag reveal" ref={r[2]}>The reality → the rescue</div>
          <h2 className="reveal" ref={r[3]}>Every morning is<br /><em>a gauntlet.</em><br />Until it isn't.</h2>

          <div className="story-tabs reveal" ref={r[4]} role="tablist">
            {STORY_STAGES.map(s => (
              <button
                key={s.stage}
                type="button"
                className="story-tab"
                role="tab"
                aria-selected={activeStage === s.stage}
                onClick={() => setActiveStage(s.stage)}
              >
                <span className="st-num">{s.stage}</span>
                <span className="st-meta">
                  <span className="st-label">{s.label}</span>
                  <span className="st-title">{s.title}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="storyboard reveal" ref={r[5]}>
            <div className="story-scene" aria-live="polite">
              {/* Scene 1 */}
              <div className={`scene${activeStage === 1 ? ' active' : ''}`}>
                <span className="scene-q" style={{ top: '6%', left: '18%' }}>?</span>
                <span className="scene-q" style={{ top: '12%', right: '22%', transform: 'rotate(-12deg)' }}>?</span>
                <span className="scene-q" style={{ bottom: '18%', left: '22%', transform: 'rotate(8deg)' }}>?</span>
                <div className="chaos-bubble warn cb-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>HARD ROUNDS!!</div>
                <div className="chaos-bubble cb-2">40-page IAP PDF</div>
                <div className="chaos-bubble amber cb-3">7 kg · dose?</div>
                <div className="chaos-bubble warn cb-4">"Which group?"</div>
                <div className="chaos-bubble cb-5">Google → 14 tabs</div>
                <div className="chaos-bubble warn cb-6">HELP.</div>
                <div className="scene-resident" aria-hidden="true">
                  <svg viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="48" r="22" fill="#FCE9E1" stroke="#1A1F2E" strokeWidth="1.6"/>
                    <path d="M40 50c2-14 12-22 20-22s18 8 20 22c-3-2-7-3-10-2-6 2-12 6-20 6-4 0-8-1-10-4z" fill="#1A1F2E"/>
                    <circle cx="52" cy="50" r="1.6" fill="#1A1F2E"/>
                    <circle cx="68" cy="50" r="1.6" fill="#1A1F2E"/>
                    <path d="M53 60c2 1.5 4 2 7 2s5-.5 7-2" stroke="#1A1F2E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <path d="M40 75 32 110M80 75 88 110M55 70v40M65 70v40" stroke="#0A9E88" strokeWidth="3" strokeLinecap="round"/>
                    <rect x="48" y="68" width="24" height="22" rx="2" fill="#FFFFFF" stroke="#1A1F2E" strokeWidth="1.2"/>
                    <path d="M48 78h24" stroke="#D94F4F" strokeWidth="1.2"/>
                    <path d="M58 73h4" stroke="#D94F4F" strokeWidth="2"/>
                  </svg>
                </div>
              </div>

              {/* Scene 2 */}
              <div className={`scene${activeStage === 2 ? ' active' : ''}`}>
                <div className="scene-clock"><span className="clock-dot" />2:58 AM</div>
                <div className="scene-protocol">
                  <div className="sp-head">
                    <span>Dengue in Children · Ch.138</span>
                    <span className="sp-tag">CRITICAL PHASE</span>
                  </div>
                  <div className="sp-row"><span className="sp-key">HCT rise</span><span className="sp-val warn">≥20% — significant</span></div>
                  <div className="sp-row"><span className="sp-key">IV fluid</span><span className="sp-val calc">5–7 mL/kg/hr?</span></div>
                  <div className="sp-row"><span className="sp-key">Platelet</span><span className="sp-val warn">Rapid decline</span></div>
                  <div className="sp-row"><span className="sp-key">Reassess</span><span className="sp-val">2–4 hr</span></div>
                </div>
              </div>

              {/* Scene 3 */}
              <div className={`scene${activeStage === 3 ? ' active' : ''}`}>
                <div className="scene-pause-mark">
                  <div className="pause-mark-circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 30, height: 30 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </div>
                  <span className="pm-label">PauseMD</span>
                </div>
                <div className="answer-card ac-1"><span className="ac-q">IAP STG 2022</span><span className="ac-a">Ch.138 · Dengue ↗</span></div>
                <div className="answer-card ac-2"><span className="ac-q">IV fluid rate</span><span className="ac-a">5–7 mL/kg/hr ✓</span></div>
                <div className="answer-card ac-3"><span className="ac-q">Reassess at</span><span className="ac-a">2–4 hours · recheck HCT ✓</span></div>
              </div>
            </div>

            {/* Side panel */}
            <aside className="story-panel" data-stage={activeStage}>
              {(() => {
                const s = STORY_STAGES.find(x => x.stage === activeStage);
                return (
                  <>
                    <div className="panel-head">
                      <span className="ph-dot" />
                      {s.panel.head}
                    </div>
                    <div className="panel-title">{s.panel.title}</div>
                    {s.panel.lines.map((l, i) => <p key={i} className="panel-line">{l}</p>)}
                    <div className="panel-chips">
                      {s.panel.chips.map((c, i) => (
                        <span key={i} className={`p-chip${c.type ? ' ' + c.type : ''}`}>
                          <span className="p-chip-dot" />{c.label}
                        </span>
                      ))}
                    </div>
                    <div className="panel-meter">
                      <div className="meter-row">
                        <span>{s.panel.meter.label}</span>
                        <div className="meter-bar"><div className="meter-fill" /></div>
                        <span className="meter-val">{s.panel.meter.value}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </aside>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features">
        <div className="section-tag reveal" ref={r[6]}>What PauseMD does</div>
        <h2 className="reveal" ref={r[7]}>Everything you need.<br /><em>In under 10 seconds.</em></h2>
        <p className="section-intro reveal" ref={r[8]}>Four tools. Zero PDF hunts.</p>

        <div className="features-grid">
          {/* Featured: STG Search */}
          <div className="feat-card featured reveal" ref={r[9]}>
            <div>
              <div className="feat-num">
                01 · IAP PROTOCOL SEARCH
                <span className="feat-live-badge"><span className="feat-live-badge-dot" />LIVE NOW</span>
              </div>
              <div className="feat-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </div>
              <h3>IAP Guidelines Search</h3>
              <p>All {IAP_COUNT} IAP Standard Treatment Guidelines, searchable by disease, symptom, or keyword. <strong>Handles typos and partial names</strong> — type "cogh" and you'll find Cough. No PDF hunting. Direct link to the source.</p>
              <div className="feat-tags">
                <span className="tag">Fuzzy search</span>
                <span className="tag">IAP STG 2022</span>
                <span className="tag">{IAP_COUNT} guidelines</span>
                <span className="tag">No login</span>
              </div>
            </div>
            <div className="feat-preview">
              <div className="fp-label">Try: "denge" → finds Dengue</div>
              {[['Ch.138','Dengue in Children ↗'],['Ch.048','Febrile Seizures ↗'],['Ch.011','Community Acquired Pneumonia ↗'],['Ch.079','Neonatal Jaundice ↗'],['Ch.149','Childhood Tuberculosis ↗']].map(([ch, name]) => (
                <div key={ch} className="fp-row">
                  <span className="fp-question">{ch}</span>
                  <span className="fp-answer">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Dose Calc — LIVE */}
          <div className="feat-card reveal" ref={r[10]}>
            <div className="feat-num">
              02 · EMERGENCY DOSE CALCULATOR
              <span className="feat-live-badge"><span className="feat-live-badge-dot" />LIVE NOW</span>
            </div>
            <div className="feat-icon" style={{ background: 'rgba(217,79,79,0.10)', borderColor: 'rgba(217,79,79,0.25)' }}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'var(--red)' }}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h3>Emergency Dose Calc</h3>
            <p>Weight → all drugs calculated instantly. <strong>Every emergency drug, every concentration, every volume.</strong> No mental math under pressure. Adrenaline, Diazepam, RSI drugs, fluids — all 30+ drugs.</p>
            <div className="feat-flow" aria-hidden="true">
              <div className="ff-cell"><span className="ff-label">Input</span>23 kg</div>
              <div className="ff-arrow">→</div>
              <div className="ff-cell out"><span className="ff-label">Adrenaline</span>0.23 mg · 2.3 mL</div>
            </div>
            <div className="feat-tags">
              <span className="tag">30+ drugs</span>
              <span className="tag">IAP/PALS 2020</span>
              <span className="tag">Max doses enforced</span>
              <span className="tag">Offline</span>
            </div>
            <Link to="/calc" className="btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex', padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}>
              Try Dose Calc →
            </Link>
          </div>

          {/* Rounds Prep */}
          <div className="feat-card reveal" ref={r[11]}>
            <div className="feat-num">03 · HIGHEST REQUESTED FEATURE</div>
            <div className="feat-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
            </div>
            <h3>Rounds Prep Mode</h3>
            <p>Enter your patient's details — chief complaint, day of illness, current labs — and get <strong>the exact questions your consultant will ask, with the answers</strong>. Sourced from IAP and AIIMS protocols.</p>
            <div className="feat-tags">
              <span className="tag">AI-powered</span><span className="tag">IAP grounded</span><span className="tag">Pediatrics</span><span className="tag">Common mistakes</span>
            </div>
          </div>

          {/* Differential */}
          <div className="feat-card reveal" ref={r[12]}>
            <div className="feat-num">04</div>
            <div className="feat-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v3l2 2"/></svg>
            </div>
            <h3>Symptom → Differential</h3>
            <p className="feat-line">Age + 3 symptoms. <strong>4–5 ranked Dx</strong>.</p>
            <div className="feat-flow" aria-hidden="true">
              <div className="ff-cell"><span className="ff-label">Input</span>2y · fever · rash · vomiting</div>
              <div className="ff-arrow">→</div>
              <div className="ff-cell out"><span className="ff-label">Output</span>Dengue · Measles · UTI · …</div>
            </div>
            <div className="feat-tags">
              <span className="tag">Prevalence-ranked</span><span className="tag">Rule-out</span><span className="tag">Protocol linked</span><span className="tag">Age-adjusted</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALC TEASER ── */}
      <div className="calc-teaser-section" id="calculator">
        <div className="calc-teaser-inner">
          <div className="section-tag reveal no-line" ref={r[13]} style={{ justifyContent: 'center' }}>Live Feature · Try It Now</div>
          <h2 className="reveal" ref={r[14]}>3 kg or 30 kg.<br /><em>Every dose, instantly.</em></h2>
          <p className="section-intro reveal" ref={r[15]} style={{ margin: '0 auto 0', textAlign: 'center', maxWidth: '480px' }}>
            Type a weight. Watch 30+ emergency drugs calculate in real-time.
            Every concentration, every maximum dose, every volume to draw.
          </p>

          <div className="calc-teaser-widget reveal" ref={r[16]}>
            <WeightInput weight={teaserWeight} onChange={setTeaserWeight} compact />
            <div className="teaser-cards">
              {teaserDrugs.map(drug => (
                <DrugCard key={drug.id} drug={drug} weight={teaserWeight} compact />
              ))}
            </div>
            <div className="teaser-cta">
              <Link to="/calc" className="btn-primary">
                Open Full Calculator — All 30+ Drugs →
              </Link>
              <span className="teaser-note">Free · No login · Works offline</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRUST SECTION ── */}
      <div className="trust-section" id="guidelines" ref={sourceRef}>
        <div className="trust-inner">
          <div className="section-tag">Built on trust</div>
          <h2>Your consultants trust<br /><em>the source.</em> So do we.</h2>
          <div className="trust-grid">
            <div className="trust-text">
              <p className="trust-headline">Gold-standard guidelines.<br /><em>Findable in 2 taps.</em></p>
              <div className="trust-quote">
                <span className="tq-label">What you can say in rounds</span>
                "IAP STG 2022, Chapter 138."<br />
                <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>Not "I saw it on an app."</span>
              </div>
              <details className="trust-details">
                <summary>How we use the sources</summary>
                <p>PauseMD doesn't rewrite IAP, AIIMS or WHO guidelines. We make them findable in 2 taps, surface what's clinically relevant for your patient's exact scenario, and keep the source citation visible on every screen.</p>
              </details>
              <div className="doc-preview" style={{ marginTop: '1.5rem' }}>
                <div className="doc-topbar"><span className="doc-topbar-dot" />Dengue in Children · IAP STG 2022 · Ch.138 · Group B</div>
                <div className="doc-content">
                  {[['HCT rise from baseline','≥20% — clinically significant','warn'],['Platelet trend','Rapid decline — critical phase','warn'],['IV fluid start','5–7 mL/kg/hr isotonic crystalloid','ok'],['Reassess at','2–4 hours — recheck HCT','caution'],['Discharge HCT target','38–40% or baseline','ok']].map(([k,v,cls]) => (
                    <div key={k} className="doc-row"><span className="doc-key">{k}</span><span className={`doc-val ${cls}`}>{v}</span></div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1rem', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>CONTENT SOURCED FROM</p>
              <div className="source-cards">
                <div className="source-card"><div className="source-logo iap">IAP</div><div className="source-info"><h4>Indian Academy of Pediatrics</h4><p>Standard Treatment Guidelines 2022 · {IAP_COUNT}+ diseases</p></div><span className="source-badge">ACTIVE</span></div>
                <div className="source-card"><div className="source-logo aiims">AIIMS</div><div className="source-info"><h4>AIIMS PICU / NICU Protocols</h4><p>Critical care, neonatal, and emergency protocols</p></div><span className="source-badge">ACTIVE</span></div>
                <div className="source-card"><div className="source-logo who">WHO</div><div className="source-info"><h4>WHO / CDC Guidelines</h4><p>Dengue, fever management, tropical diseases</p></div><span className="source-badge">ACTIVE</span></div>
                <div className="source-card source-card--dim"><div className="source-logo" style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--muted)' }}>FOGSI</div><div className="source-info"><h4>FOGSI Guidelines</h4><p>OBGYN branch — coming in Phase 2</p></div><span className="source-badge" style={{ color: 'var(--muted)', borderColor: 'var(--border)', background: 'transparent' }}>SOON</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BRANCHES ── */}
      <section>
        <div className="section-tag reveal" ref={r[17]}>Roadmap</div>
        <h2 className="reveal">Starting with <em>Pediatrics.</em><br />Built for every branch.</h2>
        <p className="section-intro reveal">We're building branch by branch, with residents from each specialty shaping the content. Pediatrics launches first.</p>
        <div className="branches-row">
          {[['🩺','Pediatrics','launching'],['🤱','OBGYN','soon'],['💊','Medicine','soon'],['🔪','Surgery','soon'],['🦴','Ortho & More','soon']].map(([icon, name, status]) => (
            <div key={name} className={`branch-card${status === 'launching' ? ' active' : ''} reveal`}>
              <span className="branch-icon">{icon}</span>
              <div className="branch-name">{name}</div>
              <div className={`branch-status ${status}`}>{status === 'launching' ? 'Launching' : status === 'soon' ? (name === 'OBGYN' ? 'Phase 2' : name === 'Medicine' || name === 'Surgery' ? 'Phase 3' : 'Coming') : 'Coming'}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WAITLIST ── */}
      <div className="waitlist-section" id="waitlist">
        <div className="waitlist-inner">
          <div className="section-tag" style={{ justifyContent: 'center' }}>Join the waitlist</div>
          <h2>Be the first resident<br /><em>to run <span style={{ color: 'var(--text)' }}>Pause</span>MD.</em></h2>
          <p className="section-intro">We're building this with residents, not for them. Tell us your branch, your role, and what you wish you had during your last duty. We're reading every response.</p>

          <form className="waitlist-form" onSubmit={handleWaitlist}>
            <div className={`success-state${submitted ? ' visible' : ''}`} id="successState">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h3>You're on the list.</h3>
              <p>We'll reach out when your branch is ready. We've noted your suggestion — it goes straight to the team.</p>
            </div>

            {!submitted && <>
              <div className="form-row">
                <div className="form-group"><label>Full name</label><input type="text" name="name" placeholder="Dr. Your Name" required /></div>
                <div className="form-group"><label>Email address</label><input type="email" name="email" placeholder="you@hospital.com" required /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Your role</label>
                  <select name="role">
                    <option value="">Select your year</option>
                    {['Intern / House Officer','JR1 (PGY-1)','JR2 (PGY-2)','JR3 (PGY-3)','Senior Resident','Consultant / Attending'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Branch / Specialty</label>
                  <select name="branch">
                    <option value="">Select your branch</option>
                    {['Pediatrics','Medicine','Surgery','OBGYN','Orthopedics','Anesthesia','Dermatology','Emergency Medicine','Other'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Hospital / Institution <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label><input type="text" name="hospital" placeholder="AIIMS, PGIMER, Your Govt. Hospital…" /></div>
              <div className="form-group"><label>What ONE feature would make you say "I need this app right now"?</label><textarea name="suggestion" placeholder="Be honest. What do you wish existed during your last duty?" /></div>
              <button type="submit" className="form-submit">Join the Waitlist — It's Free →</button>
            </>}
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}
