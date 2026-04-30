export default function PathwayOutcome({ type, message, onRestart }) {
  const labels = {
    outcome_proceed: 'Proceed',
    outcome_caution: 'Caution',
    outcome_escalate: 'Escalate',
  };

  const icons = {
    outcome_proceed: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    outcome_caution: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    outcome_escalate: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  };

  const typeKey = type || 'outcome_proceed';
  const cssClass = typeKey.replace('outcome_', '');

  return (
    <div className={`pathway-outcome ${cssClass}`} role="status" aria-live="polite">
      <span className="pathway-outcome-badge">
        {icons[typeKey]}
        {labels[typeKey] || 'Result'}
      </span>
      <h3 className="pathway-outcome-title">
        {typeKey === 'outcome_proceed' && 'Clinical recommendation'}
        {typeKey === 'outcome_caution' && 'Consider an alternative approach'}
        {typeKey === 'outcome_escalate' && 'Escalation needed'}
      </h3>
      {message && (
        <p className="pathway-outcome-message">{message}</p>
      )}
      <button className="btn-primary" onClick={onRestart} style={{ marginTop: '0.5rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
        </svg>
        Start over
      </button>
    </div>
  );
}
