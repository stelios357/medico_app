import { useState } from 'react';

const PICO_FIELDS = [
  { key: 'population',   label: 'Population' },
  { key: 'intervention', label: 'Intervention' },
  { key: 'comparator',   label: 'Comparator' },
  { key: 'outcome',      label: 'Outcome' },
];

export default function PicoBlock({ pico, collapsed: collapsedProp, onToggle }) {
  const [internalCollapsed, setInternalCollapsed] = useState(true);

  /* Support both controlled (collapsed + onToggle) and uncontrolled usage */
  const isControlled = collapsedProp !== undefined && onToggle !== undefined;
  const isCollapsed  = isControlled ? collapsedProp : internalCollapsed;

  function handleToggle() {
    if (isControlled) {
      onToggle();
    } else {
      setInternalCollapsed(c => !c);
    }
  }

  return (
    <div className="monograph-section">
      <button
        type="button"
        className="monograph-section-head"
        onClick={handleToggle}
        aria-expanded={!isCollapsed}
      >
        <span className="section-head-label">PICO</span>
        <svg
          className={`chevron ${isCollapsed ? '' : 'chevron--open'}`}
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

      {!isCollapsed && (
        <div className="monograph-section-body pico-body">
          {PICO_FIELDS.map(({ key, label }) => (
            <div key={key} className="pico-row">
              <span className="pico-label">{label}</span>
              <span className="pico-value">{pico?.[key] ?? '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
