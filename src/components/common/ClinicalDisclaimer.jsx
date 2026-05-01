export default function ClinicalDisclaimer({
  className = "clinical-disclaimer",
  textClassName = "clinical-disclaimer__text",
  iconClassName = "clinical-disclaimer__icon",
}) {
  return (
    <div className={className} role="note" aria-label="Clinical disclaimer">
      <p className={textClassName}>
        <svg className={iconClassName} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        For clinical reference only. Does not replace professional judgment or clinical guidelines.
      </p>
    </div>
  )
}
