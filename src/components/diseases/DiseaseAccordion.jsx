import { useState } from 'react'

const SECTIONS = [
  { key: 'causes', label: 'Causes' },
  { key: 'symptoms', label: 'Symptoms' },
  { key: 'diagnosis', label: 'Diagnosis' },
  { key: 'treatment', label: 'Treatment' },
  { key: 'whenToSeeDoctor', label: 'When to See a Doctor' },
]

function ChevronIcon({ open }) {
  return (
    <svg
      className={`dis-accordion-chevron${open ? ' open' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function renderParagraphs(text) {
  return text
    .split(/\r?\n+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map((s, i) => <p key={i} className="dis-accordion-para">{s}</p>)
}

function AccordionItem({ sectionKey, label, content }) {
  const [open, setOpen] = useState(false)
  const id = `dis-section-${sectionKey}`

  return (
    <div className="dis-accordion-item">
      <button
        type="button"
        className="dis-accordion-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(prev => !prev)}
      >
        <span className="dis-accordion-label">{label}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div id={id} className="dis-accordion-body">
          {renderParagraphs(content)}
        </div>
      )}
    </div>
  )
}

export default function DiseaseAccordion({ disease }) {
  const visibleSections = SECTIONS.filter(s => {
    const v = disease[s.key]
    return v != null && String(v).trim() !== ''
  })

  if (visibleSections.length === 0) return null

  return (
    <div className="dis-accordion">
      {visibleSections.map(s => (
        <AccordionItem
          key={s.key}
          sectionKey={s.key}
          label={s.label}
          content={disease[s.key]}
        />
      ))}
    </div>
  )
}
