import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import procedures from '../data/procedures.json'
import '../styles/procedures.css'

const procedureMap = Object.fromEntries(procedures.map(p => [p.slug, p]))

export default function ProcedureDetail() {
  const { slug } = useParams()
  const procedure = procedureMap[slug] ?? null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  return (
    <>
      <Nav />
      <main className="pd-page">
        <div className="pd-container">
          <Link to="/procedures" className="pd-back-link">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
            All procedures
          </Link>

          {!procedure && (
            <div className="pd-notfound">
              <h2 className="pd-notfound-title">Procedure not found</h2>
              <p className="pd-notfound-msg">The procedure "{slug}" does not exist in the reference library.</p>
              <Link to="/procedures" className="pd-back-link">Browse all procedures</Link>
            </div>
          )}

          {procedure && (
            <>
              <div className="pd-highlights">
                <div className="pd-header">
                  <h1 className="pd-heading">{procedure.name}</h1>
                  <span className="pd-specialty-badge">{procedure.specialty}</span>
                </div>
                <p className="pd-description">{procedure.description}</p>
              </div>

              <div className="pd-section">
                <p className="pd-section-title">Indications</p>
                <p className="pd-section-text">{procedure.indications}</p>
              </div>

              <div className="pd-section">
                <p className="pd-section-title">Contraindications</p>
                <p className="pd-section-text">{procedure.contraindications}</p>
              </div>

              <div className="pd-section">
                <p className="pd-section-title">Steps</p>
                <ol className="pd-steps-list" aria-label="Procedure steps">
                  {procedure.steps.map((step, i) => (
                    <li key={i} className="pd-step-item">
                      <span className="pd-step-num" aria-hidden="true">{i + 1}</span>
                      <span className="pd-step-text">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pd-section">
                <p className="pd-section-title">Complications</p>
                <p className="pd-section-text">{procedure.complications}</p>
              </div>

              {procedure.notes && (
                <div className="pd-notes">
                  <p className="pd-notes-label">Clinical note</p>
                  <p className="pd-notes-text">{procedure.notes}</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
