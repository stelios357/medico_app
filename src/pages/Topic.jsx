import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import topicsData from '../data/topicsData.js';
import pathwaysData from '../data/pathwaysData.js';
import StudyMonograph from '../components/StudyMonograph/StudyMonograph.jsx';
import PathwayViewer from '../components/Pathway/PathwayViewer.jsx';
import { useBookmarks } from '../hooks/useBookmarks.js';

const ForestPlotModal = lazy(() => import('../components/ForestPlot/ForestPlotModal.jsx'));

const TABS = [
  { id: 'summary',  label: 'Summary' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'tools',    label: 'Clinical tools' },
  { id: 'refs',     label: 'References' },
];

const DESIGN_FILTER_OPTIONS = ['All', 'RCT', 'cohort', 'meta-analysis', 'case-control', 'cross-sectional'];

function gradeColor(level) {
  return { high: 'high', moderate: 'moderate', low: 'low', 'very-low': 'very-low' }[level] || 'low';
}

function gradeLabel(level) {
  return { high: 'GRADE: High', moderate: 'GRADE: Moderate', low: 'GRADE: Low', 'very-low': 'GRADE: Very Low' }[level] || level;
}

export default function Topic() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'summary');
  const [expandedStudy, setExpandedStudy] = useState(null);
  const [selectedStudies, setSelectedStudies] = useState([]);
  const [designFilter, setDesignFilter] = useState('All');
  const [showPathway, setShowPathway] = useState(false);
  const [showForestPlot, setShowForestPlot] = useState(false);
  const [citationStyle, setCitationStyle] = useState('vancouver');
  const [copyAllMsg, setCopyAllMsg] = useState('');
  const { toggle: toggleBookmark, isBookmarked } = useBookmarks();

  const topic = topicsData.find(t => t.slug === slug);
  const pathway = topic?.pathwayId ? pathwaysData.find(p => p.id === topic.pathwayId) : null;

  useEffect(() => {
    const tab = searchParams.get('tab') || 'summary';
    setActiveTab(tab);
  }, [searchParams]);

  function switchTab(tabId) {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  }

  if (!topic) {
    return (
      <div className="topic-page">
        <Nav />
        <div className="topic-page-inner" style={{ paddingTop: '5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>Topic not found.</p>
          <Link to="/" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>← Back to search</Link>
        </div>
      </div>
    );
  }

  const filteredStudies = designFilter === 'All'
    ? topic.studies
    : topic.studies.filter(s => s.design === designFilter);

  function toggleStudySelect(id) {
    setSelectedStudies(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function copyAllCitations() {
    const text = topic.references.map((r, i) => `[${i + 1}] ${r.citation}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopyAllMsg('Copied!');
      setTimeout(() => setCopyAllMsg(''), 2000);
    });
  }

  const metaAnalysis = topic.studies.find(s => s.design === 'meta-analysis');

  return (
    <div className="topic-page">
      <Nav />
      <div className="topic-page-inner">
        {/* Header */}
        <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.25rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </Link>

        <span className={`topic-grade-badge ${gradeColor(topic.gradeLevel)}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
          {gradeLabel(topic.gradeLevel)}
        </span>

        <h1 className="topic-title">{topic.title}</h1>

        <div className="topic-quick-stats">
          <span className="topic-stat"><strong>{topic.quickStats.studies}</strong>studies</span>
          <span className="topic-stat"><strong>{topic.quickStats.participants.toLocaleString()}</strong>participants</span>
          <span className="topic-stat"><strong>{topic.quickStats.followupMonths}mo</strong>follow-up</span>
          <span className="topic-stat" style={{ color: 'var(--muted)' }}>Updated {topic.lastUpdated}</span>
        </div>

        {/* Tab bar */}
        <div className="topic-tabs" role="tablist" aria-label="Topic content tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              aria-controls={`tabpanel-${t.id}`}
              className={`topic-tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => switchTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="topic-tab-content">

          {/* ── SUMMARY ── */}
          {activeTab === 'summary' && (
            <div id="tabpanel-summary" role="tabpanel" aria-label="Summary">
              <ul className="topic-bottom-lines">
                {topic.bottomLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              <blockquote className="topic-clinical-bl">
                {topic.clinicalBottomLine}
              </blockquote>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <button className="btn-primary" onClick={() => switchTab('evidence')}>
                  View evidence
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                {topic.forestPlot && (
                  <button className="drug-action-btn" onClick={() => setShowForestPlot(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    Forest plot
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── EVIDENCE ── */}
          {activeTab === 'evidence' && (
            <div id="tabpanel-evidence" role="tabpanel" aria-label="Evidence">
              {/* Filter bar */}
              <div className="evidence-filter-bar">
                <span className="evidence-filter-label">Design</span>
                {DESIGN_FILTER_OPTIONS.map(d => (
                  <button
                    key={d}
                    className={`evidence-filter-chip${designFilter === d ? ' active' : ''}`}
                    onClick={() => setDesignFilter(d)}
                    aria-pressed={designFilter === d}
                  >
                    {d}
                  </button>
                ))}
                {topic.forestPlot && (
                  <button
                    className="drug-action-btn"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => setShowForestPlot(true)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    Forest plot
                  </button>
                )}
              </div>

              {/* Study rows */}
              {filteredStudies.map(study => {
                const isOpen = expandedStudy === study.id;
                const isSelected = selectedStudies.includes(study.id);
                return (
                  <div key={study.id} className={`study-row${isOpen ? ' open' : ''}`}>
                    <div className="study-row-header" onClick={() => setExpandedStudy(isOpen ? null : study.id)}>
                      <input
                        type="checkbox"
                        className="study-row-check"
                        checked={isSelected}
                        aria-label={`Select ${study.name} for comparison`}
                        onChange={e => { e.stopPropagation(); toggleStudySelect(study.id); }}
                        onClick={e => e.stopPropagation()}
                      />
                      <div className="study-row-badges">
                        <span className={`design-badge design-${study.design.replace('-','')}`}>{study.design}</span>
                      </div>
                      <span className="study-row-name" title={study.name}>{study.name}</span>
                      <span className="study-row-n">n={study.n.toLocaleString()}</span>
                      <svg className="study-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    {isOpen && (
                      <div className="study-row-body">
                        <StudyMonograph
                          study={study}
                          variant="expanded"
                          isBookmarked={isBookmarked(study.id)}
                          onBookmarkToggle={() => toggleBookmark(study.id)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredStudies.length === 0 && (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>
                  No studies match this filter.
                </p>
              )}

              {/* Comparison drawer */}
              <div className={`comparison-drawer${selectedStudies.length >= 2 ? ' open' : ''}`} role="complementary" aria-label="Study comparison">
                <button
                  className="comparison-drawer-close"
                  onClick={() => setSelectedStudies([])}
                  aria-label="Close comparison"
                >×</button>
                <div className="comparison-drawer-inner">
                  <div style={{ flexShrink: 0, paddingRight: '1rem', borderRight: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
                      {selectedStudies.length} selected
                    </p>
                  </div>
                  {selectedStudies.map(id => {
                    const s = topic.studies.find(st => st.id === id);
                    if (!s) return null;
                    return (
                      <div key={id} style={{ minWidth: '180px', padding: '0 0.75rem', borderRight: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>{s.name}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{s.keyResult}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── CLINICAL TOOLS ── */}
          {activeTab === 'tools' && (
            <div id="tabpanel-tools" role="tabpanel" aria-label="Clinical tools">
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Context-sensitive tools for this topic.
              </p>
              {/* NNT quick-read card */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem' }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--teal)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>NNT Quick-read</p>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Evidence-based NNT</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.85rem' }}>
                  Calculate the Number Needed to Treat using data from the best available RCT in this topic.
                </p>
                <button className="drug-action-btn" onClick={() => {
                  document.querySelector('.qc-fab')?.click();
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 4H6l6 8-6 8h12"/></svg>
                  Open in Quick Calc
                </button>
              </div>
              {topic.tools && topic.tools.length === 0 && (
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  Additional clinical tools will be added as this topic is expanded.
                </p>
              )}
            </div>
          )}

          {/* ── REFERENCES ── */}
          {activeTab === 'refs' && (
            <div id="tabpanel-refs" role="tabpanel" aria-label="References">
              <div className="references-header">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Format</span>
                  {['vancouver', 'apa'].map(f => (
                    <button
                      key={f}
                      className={`evidence-filter-chip${citationStyle === f ? ' active' : ''}`}
                      onClick={() => setCitationStyle(f)}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button className="drug-action-btn" onClick={copyAllCitations}>
                  {copyAllMsg || 'Export all'}
                </button>
              </div>
              {topic.references.map((ref, i) => (
                <div key={ref.id} className="reference-item">
                  <span className="reference-num">[{i + 1}]</span>
                  <div className="reference-text">
                    {ref.citation}
                    {ref.doi && (
                      <> · <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noopener noreferrer">DOI</a></>
                    )}
                    {ref.pubmedId && (
                      <> · <a href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pubmedId}`} target="_blank" rel="noopener noreferrer">PubMed</a></>
                    )}
                  </div>
                  <div className="reference-actions">
                    <button
                      className="drug-action-btn"
                      aria-label="Copy citation"
                      onClick={() => navigator.clipboard.writeText(ref.citation)}
                      title="Copy citation"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pathway card */}
        {pathway && (
          <div className="pathway-card">
            <div>
              <p className="pathway-card-meta">Clinical Pathway</p>
              <p className="pathway-card-title">{pathway.title}</p>
              <p className="pathway-card-steps">{pathway.steps.length} steps · Evidence-guided</p>
            </div>
            <button className="btn-primary" onClick={() => setShowPathway(true)}>
              Walk through pathway
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPathway && pathway && (
        <PathwayViewer pathway={pathway} onClose={() => setShowPathway(false)} />
      )}

      {showForestPlot && topic.forestPlot && (
        <Suspense fallback={null}>
          <ForestPlotModal
            data={topic.forestPlot}
            studies={topic.studies}
            onClose={() => setShowForestPlot(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
