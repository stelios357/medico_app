export default function SearchRefinements({ hasDrugs, hasDiseases, activeFilter, onFilter }) {
  if (!hasDrugs && !hasDiseases) return null

  return (
    <div className="gs-refinements" role="group" aria-label="Filter results">
      {hasDrugs && (
        <button
          className={`gs-refine-chip${activeFilter === 'drugs' ? ' active' : ''}`}
          onClick={() => onFilter(activeFilter === 'drugs' ? null : 'drugs')}
          aria-pressed={activeFilter === 'drugs'}
        >
          Medications
        </button>
      )}
      {hasDiseases && (
        <button
          className={`gs-refine-chip${activeFilter === 'diseases' ? ' active' : ''}`}
          onClick={() => onFilter(activeFilter === 'diseases' ? null : 'diseases')}
          aria-pressed={activeFilter === 'diseases'}
        >
          Conditions
        </button>
      )}
    </div>
  )
}
