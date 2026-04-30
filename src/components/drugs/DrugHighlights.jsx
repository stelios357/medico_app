export default function DrugHighlights({ drug }) {
  const primaryName = drug.brandName || drug.genericName || 'Unknown Drug'
  const showGeneric = drug.brandName && drug.genericName

  return (
    <div className="dd-highlights">
      <h1 className="dd-heading">{primaryName}</h1>
      {showGeneric && (
        <p className="dd-generic-name">{drug.genericName}</p>
      )}

      <div className="dd-badges">
        <span className={`dd-badge ${drug.isRx ? 'dd-badge-rx' : 'dd-badge-otc'}`}>
          {drug.isRx ? 'Rx' : 'OTC'}
        </span>
        {drug.drugClass && (
          <span className="dd-badge dd-badge-class">{drug.drugClass}</span>
        )}
        {drug.manufacturer && (
          <span className="dd-badge dd-badge-mfr">{drug.manufacturer}</span>
        )}
      </div>

      {drug.hasBlackBoxWarning && (
        <div className="dd-blackbox-banner" role="alert">
          <span className="dd-blackbox-banner-icon" aria-hidden="true">⚠</span>
          <p className="dd-blackbox-banner-text">
            This drug carries a Black Box Warning. Review full prescribing information.
          </p>
        </div>
      )}

      {drug.indicationShort && (
        <p className="dd-indication-short">{drug.indicationShort}</p>
      )}
    </div>
  )
}
