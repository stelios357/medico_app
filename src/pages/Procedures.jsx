import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import procedures from '../data/procedures.json'
import '../styles/procedures.css'

const ALL_SPECIALTIES = ['All', ...Array.from(new Set(procedures.map(p => p.specialty))).sort()]

export default function Procedures() {
  const [activeSpecialty, setActiveSpecialty] = useState('All')

  const filtered = useMemo(() => {
    if (activeSpecialty === 'All') return procedures
    return procedures.filter(p => p.specialty === activeSpecialty)
  }, [activeSpecialty])

  return (
    <>
      <Nav />
      <main className="proc-page">
        <div className="proc-header">
          <div className="proc-header-inner">
            <Link to="/" className="proc-back-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
              Back to search
            </Link>
            <h1 className="proc-title">Procedures</h1>
            <p className="proc-subtitle">{procedures.length} common clinical procedures — reference steps, indications, and complications</p>
          </div>
        </div>

        <div className="proc-filters">
          {ALL_SPECIALTIES.map(spec => (
            <button
              key={spec}
              type="button"
              className={`proc-filter-chip${activeSpecialty === spec ? ' proc-filter-chip--active' : ''}`}
              onClick={() => setActiveSpecialty(spec)}
            >
              {spec}
            </button>
          ))}
        </div>

        <div className="proc-container">
          {filtered.length === 0 ? (
            <p className="proc-empty">No procedures found for this specialty.</p>
          ) : (
            <div className="proc-grid">
              {filtered.map(proc => (
                <Link key={proc.slug} to={`/procedure/${proc.slug}`} className="proc-card">
                  <div className="proc-card-top">
                    <h2 className="proc-card-name">{proc.name}</h2>
                    <span className="proc-card-specialty">{proc.specialty}</span>
                  </div>
                  <p className="proc-card-desc">{proc.description}</p>
                  <svg className="proc-card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
