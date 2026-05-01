export default function DiseaseSkeleton() {
  return (
    <div className="dis-skeleton" aria-busy="true" aria-label="Loading condition information">
      <div className="dis-skeleton-block dis-skeleton-title" />
      <div className="dis-skeleton-block dis-skeleton-badge" />
      <div className="dis-skeleton-block dis-skeleton-summary" />
      <div className="dis-skeleton-block dis-skeleton-actions" />
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="dis-skeleton-block dis-skeleton-row" />
      ))}
    </div>
  )
}
