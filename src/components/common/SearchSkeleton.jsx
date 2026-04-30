export default function SearchSkeleton() {
  return (
    <div className="gs-skeleton" aria-busy="true" aria-label="Loading results">
      {[0, 1, 2].map(i => (
        <div key={i} className="gs-skeleton-item">
          <div className="gs-skeleton-title" />
          <div className="gs-skeleton-sub" />
        </div>
      ))}
    </div>
  )
}
