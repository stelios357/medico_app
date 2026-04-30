import { useState, useCallback } from 'react';
import PicoBlock from './PicoBlock.jsx';
import RoBGrid from './RoBGrid.jsx';

/* ── helpers ── */
function deriveGrade(jadad) {
  if (jadad === 5)           return 'high';
  if (jadad >= 3)            return 'moderate';
  if (jadad >= 1)            return 'low';
  return 'very-low';
}

function truncate(str, max = 140) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max).trimEnd() + '…';
}

/* ── sub-components ── */
function DesignBadge({ design }) {
  const d = (design ?? '').toLowerCase();
  let cls = 'design-badge';
  if (d === 'rct')            cls += ' design-badge--rct';
  else if (d === 'cohort')    cls += ' design-badge--cohort';
  else if (d === 'meta-analysis') cls += ' design-badge--meta';
  else                        cls += ' design-badge--other';
  return <span className={cls}>{design}</span>;
}

function GradeBadge({ grade }) {
  const map = {
    high:       'grade-badge--high',
    moderate:   'grade-badge--moderate',
    low:        'grade-badge--low',
    'very-low': 'grade-badge--very-low',
  };
  const labelMap = {
    high:       'GRADE: High',
    moderate:   'GRADE: Moderate',
    low:        'GRADE: Low',
    'very-low': 'GRADE: Very Low',
  };
  return (
    <span className={`grade-badge ${map[grade] ?? ''}`} title={labelMap[grade]}>
      {labelMap[grade] ?? `GRADE: ${grade}`}
    </span>
  );
}

function BookmarkButton({ isBookmarked, onToggle }) {
  return (
    <button
      type="button"
      className={`bookmark-btn ${isBookmarked ? 'bookmark-btn--active' : ''}`}
      onClick={onToggle}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this study'}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this study'}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        {isBookmarked
          ? <path d="M3 2h12v15l-6-3.5L3 17V2z" fill="currentColor" />
          : <path d="M3 2h12v15l-6-3.5L3 17V2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        }
      </svg>
    </button>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="monograph-section">
      <button
        type="button"
        className="monograph-section-head"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="section-head-label">{title}</span>
        <svg
          className={`chevron ${open ? 'chevron--open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && <div className="monograph-section-body">{children}</div>}
    </div>
  );
}

/* ── main component ── */
export default function StudyMonograph({
  study,
  variant = 'full',
  onExpand,
  onBookmarkToggle,
  isBookmarked = false,
}) {
  const grade = deriveGrade(study?.jadad ?? 0);
  const doiUrl     = study?.doi     ? `https://doi.org/${study.doi}` : null;
  const pubmedUrl  = study?.pubmedId ? `https://pubmed.ncbi.nlm.nih.gov/${study.pubmedId}` : null;
  const allOpen    = variant === 'full';

  const handleCopyCitation = useCallback(() => {
    const citation = `${study.authors}. ${study.name}. ${study.journal}. ${study.year}. DOI: ${study.doi}`;
    navigator.clipboard?.writeText(citation).catch(() => {
      /* silent fallback — clipboard may be unavailable */
    });
  }, [study]);

  if (!study) return null;

  /* ─────────────────── COMPACT ─────────────────── */
  if (variant === 'compact') {
    return (
      <article className="monograph monograph--compact">
        <div className="monograph-header">
          <div className="monograph-badges">
            <DesignBadge design={study.design} />
            <GradeBadge grade={grade} />
            <span className="monograph-year">{study.year}</span>
          </div>
          <BookmarkButton isBookmarked={isBookmarked} onToggle={onBookmarkToggle} />
        </div>

        <h3 className="monograph-title">{study.name}</h3>

        {study.keyResult && (
          <p className="monograph-takeaway">{truncate(study.keyResult)}</p>
        )}

        <div className="monograph-actions monograph-actions--compact">
          <button
            type="button"
            className="monograph-btn monograph-btn--primary"
            onClick={onExpand}
          >
            View details
          </button>
        </div>
      </article>
    );
  }

  /* ─────────────────── EXPANDED / FULL ─────────────────── */
  return (
    <article className={`monograph monograph--${variant}`}>
      {/* Header row */}
      <div className="monograph-header">
        <div className="monograph-badges">
          <DesignBadge design={study.design} />
          <GradeBadge grade={grade} />
          <span className="monograph-year">{study.year}</span>
        </div>
        <BookmarkButton isBookmarked={isBookmarked} onToggle={onBookmarkToggle} />
      </div>

      {/* Title */}
      <h2 className="monograph-title">{study.name}</h2>

      {/* Authors / journal / DOI */}
      <div className="monograph-meta">
        {study.authors && <span className="monograph-authors">{study.authors}</span>}
        {study.journal  && <span className="monograph-journal">{study.journal}</span>}
        {doiUrl && (
          <a
            href={doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="monograph-doi"
          >
            DOI: {study.doi}
          </a>
        )}
      </div>

      {/* Collapsible sections */}
      <div className="monograph-sections">
        <CollapsibleSection title="PICO" defaultOpen={allOpen}>
          <PicoBlock pico={study.pico} collapsed={false} />
        </CollapsibleSection>

        <CollapsibleSection title="Key Findings" defaultOpen={allOpen}>
          <div className="monograph-key-findings">
            {study.primaryOutcome && (
              <div className="kf-row">
                <span className="kf-label">Primary outcome</span>
                <span className="kf-value">{study.primaryOutcome}</span>
              </div>
            )}
            {study.keyResult && (
              <div className="kf-row">
                <span className="kf-label">Key result</span>
                <span className="kf-value kf-value--highlight">{study.keyResult}</span>
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Limitations" defaultOpen={allOpen}>
          <p className="monograph-limitations">See full publication for detailed limitations discussion.</p>
        </CollapsibleSection>

        <CollapsibleSection title="Risk of Bias" defaultOpen={allOpen}>
          <RoBGrid domains={study.robDomains ?? []} />
        </CollapsibleSection>
      </div>

      {/* Action bar */}
      <div className="monograph-actions">
        {pubmedUrl && (
          <a
            href={pubmedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="monograph-btn monograph-btn--outline"
          >
            Open in PubMed
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 10L10 2M10 2H5M10 2v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        )}
        <button
          type="button"
          className="monograph-btn monograph-btn--ghost"
          onClick={handleCopyCitation}
        >
          Copy citation
        </button>
      </div>
    </article>
  );
}
