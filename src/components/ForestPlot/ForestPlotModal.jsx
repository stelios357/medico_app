import { useState, useEffect, useRef, useCallback } from 'react';
import ForestPlotSVG from './ForestPlotSVG.jsx';
import StudyMonograph from '../StudyMonograph/StudyMonograph.jsx';

export default function ForestPlotModal({ data, onClose, studies = [] }) {
  const [selectedStudyId, setSelectedStudyId] = useState(null);
  const svgRef = useRef(null);
  const panelRef = useRef(null);

  /* Close on Escape */
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  /* Lock body scroll while modal is open */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* Trap focus inside panel (minimal implementation) */
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  /* Find selected study object from the studies array */
  const selectedStudy = selectedStudyId
    ? studies.find(s => s.id === selectedStudyId) ?? null
    : null;

  /* ── Download SVG ── */
  const handleDownload = useCallback(() => {
    const el = svgRef.current;
    if (!el) return;

    const serializer = new XMLSerializer();
    let svgStr = serializer.serializeToString(el);

    /* Inject CSS vars as literal colors for standalone SVG */
    svgStr = svgStr.replace(/var\(--teal[^)]*\)/g, '#0A9E88');
    svgStr = svgStr.replace(/var\(--amber[^)]*\)/g, '#E8900A');
    svgStr = svgStr.replace(/var\(--muted[^)]*\)/g, '#6B7A8D');
    svgStr = svgStr.replace(/var\(--text[^)]*\)/g, '#1A1F2E');

    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `forest-plot-${(data?.outcome ?? 'plot').replace(/\s+/g, '-').toLowerCase()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  return (
    /* Backdrop */
    <div
      className="fp-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Forest plot: ${data?.outcome ?? 'Forest plot'}`}
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      {/* Panel */}
      <div
        className="fp-modal-panel"
        ref={panelRef}
        tabIndex={-1}
      >
        {/* ── Header ── */}
        <div className="fp-modal-header">
          <h2 className="fp-modal-title">
            {selectedStudy ? selectedStudy.name : (data?.outcome ?? 'Forest Plot')}
          </h2>
          <button
            type="button"
            className="fp-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4 4l12 12M16 4L4 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* ── Content ── */}
        <div className="fp-modal-body">
          {selectedStudy ? (
            /* Study monograph view */
            <>
              <button
                type="button"
                className="fp-back-btn"
                onClick={() => setSelectedStudyId(null)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to forest plot
              </button>
              <StudyMonograph
                study={selectedStudy}
                variant="expanded"
              />
            </>
          ) : (
            /* Forest plot view */
            <>
              {data ? (
                <div className="fp-svg-wrapper">
                  <ForestPlotSVG
                    ref={svgRef}
                    data={data}
                    onStudyClick={setSelectedStudyId}
                  />
                </div>
              ) : (
                <p className="fp-no-data">No forest plot data available.</p>
              )}

              {/* Action bar */}
              <div className="fp-modal-actions">
                <button
                  type="button"
                  className="fp-action-btn"
                  onClick={handleDownload}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                    <path
                      d="M7.5 2v8M4 7l3.5 3.5L11 7M2 13h11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Download SVG
                </button>
                <button
                  type="button"
                  className="fp-action-btn"
                  onClick={() => window.print()}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                    <path
                      d="M4 4V1h7v3M3 4h9a1 1 0 011 1v5H2V5a1 1 0 011-1zm1 6v4h7v-4H4z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Print
                </button>
              </div>

              {data?.studies?.length > 0 && (
                <p className="fp-hint">
                  Click a study row to view the full study monograph.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
