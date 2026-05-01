import { Link } from 'react-router-dom'

export default function SavedItems({ saved }) {
  if (!saved || saved.length === 0) return null

  return (
    <div className="hl-row">
      <p className="hl-row-label">Saved</p>
      <div className="hl-cards-scroll">
        {saved.map(item => (
          <Link key={item.id} to={item.route} className="hl-card" onClick={() => window.scrollTo(0, 0)}>
            <span className={`hl-card-type hl-card-type--${item.type}`}>{item.type}</span>
            <span className="hl-card-name">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
