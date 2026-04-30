export default function RecentSearches({ searches, onSearch }) {
  if (!searches || searches.length === 0) return null

  return (
    <div className="hl-row">
      <p className="hl-row-label">Recent</p>
      <div className="hl-chips-scroll">
        {searches.map(item => (
          <button
            key={item.key}
            type="button"
            className="hl-chip"
            onClick={() => {
              window.scrollTo(0, 0)
              onSearch(item.label)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
