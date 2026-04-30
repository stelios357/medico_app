const SPECIALTIES = [
  { slug: 'gp',        label: 'General Practice',    icon: <StethoscopeIcon /> },
  { slug: 'paeds',     label: 'Paediatrics',         icon: <PaedIcon /> },
  { slug: 'em',        label: 'Emergency Medicine',  icon: <EMIcon /> },
  { slug: 'im',        label: 'Internal Medicine',   icon: <IMIcon /> },
  { slug: 'cardio',    label: 'Cardiology',          icon: <CardioIcon /> },
  { slug: 'id',        label: 'Infectious Disease',  icon: <IDIcon /> },
  { slug: 'psych',     label: 'Psychiatry',          icon: <PsychIcon /> },
  { slug: 'surgery',   label: 'Surgery',             icon: <SurgeryIcon /> },
  { slug: 'obgyn',     label: 'Obstetrics',          icon: <ObIcon /> },
  { slug: 'other',     label: 'Other',               icon: <OtherIcon /> },
];

function StethoscopeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.8 2.3A.3.3 0 104.8 2a.3.3 0 000 .3M7.2 2.3a.3.3 0 10.3-.3.3.3 0 000 .3M6 2v4a3 3 0 006 0V2M12 10v4a4 4 0 008 0v-3"/><circle cx="20" cy="16" r="1"/>
    </svg>
  );
}
function PaedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4"/><path d="M8 14s-4 2-4 6h16c0-4-4-6-4-6"/>
    </svg>
  );
}
function EMIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="10"/>
    </svg>
  );
}
function IMIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12h6M12 9v6"/>
    </svg>
  );
}
function CardioIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}
function IDIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  );
}
function PsychIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/><circle cx="12" cy="12" r="10"/>
    </svg>
  );
}
function SurgeryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 14l-4-4M7.5 7.5L3 3M17 3l-7 7M21 21l-4.5-4.5M16 8l-1.5 1.5M8 16l-1.5 1.5"/>
    </svg>
  );
}
function ObIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="10"/>
    </svg>
  );
}
function OtherIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>
    </svg>
  );
}

export default function SpecialtyPicker({ selected, onChange }) {
  function toggle(slug) {
    if (selected.includes(slug)) {
      onChange(selected.filter(s => s !== slug));
    } else {
      onChange([...selected, slug]);
    }
  }

  return (
    <div className="specialty-grid" role="group" aria-label="Select your specialty">
      {SPECIALTIES.map(sp => {
        const active = selected.includes(sp.slug);
        return (
          <button
            key={sp.slug}
            className={`specialty-card${active ? ' active' : ''}`}
            onClick={() => toggle(sp.slug)}
            aria-pressed={active}
            aria-label={sp.label}
          >
            <span className="specialty-icon">{sp.icon}</span>
            <span className="specialty-label">{sp.label}</span>
          </button>
        );
      })}
    </div>
  );
}
