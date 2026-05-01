import { Link } from 'react-router-dom'
import { isCommonDrug } from '../../data/commonDrugs.js'

export default function DrugCard({ drug }) {
  const primary = drug.brandName || drug.genericName || '—'
  const secondary = drug.brandName && drug.genericName ? drug.genericName : null
  const common = isCommonDrug(drug)

  return (
    <Link to={`/drug/${drug.id}`} className="gs-result-item gs-result-drug">
      <div className="gs-result-names">
        <span className="gs-result-primary">{primary}</span>
        {secondary && <span className="gs-result-secondary">{secondary}</span>}
      </div>
      <div className="gs-result-badges">
        {drug._score === 3 && <span className="gs-badge gs-badge-exact">Exact match</span>}
        {common && <span className="gs-badge gs-badge-common">Common</span>}
        {drug.hasBlackBoxWarning && <span className="gs-badge gs-badge-blackbox">⚠ Black Box</span>}
        <span className={`gs-badge ${drug.isRx ? 'gs-badge-rx' : 'gs-badge-otc'}`}>
          {drug.isRx ? 'Rx' : 'OTC'}
        </span>
        {drug.drugClass && <span className="gs-badge gs-badge-class">{drug.drugClass}</span>}
      </div>
      {drug.indicationShort && (
        <p className="gs-result-indication">{drug.indicationShort}</p>
      )}
    </Link>
  )
}
