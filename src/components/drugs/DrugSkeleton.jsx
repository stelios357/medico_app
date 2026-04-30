export default function DrugSkeleton() {
  return (
    <div className="dd-skeleton" aria-busy="true" aria-label="Loading drug information">
      <div className="dd-skeleton-block dd-skeleton-title" />
      <div className="dd-skeleton-block dd-skeleton-sub" />
      <div className="dd-skeleton-block dd-skeleton-badges" />
      <div className="dd-skeleton-block dd-skeleton-indication" />
      <div className="dd-skeleton-block dd-skeleton-actions" />
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="dd-skeleton-block dd-skeleton-row" />
      ))}
    </div>
  )
}
