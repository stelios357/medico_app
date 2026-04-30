import { useState } from 'react'

const SECTIONS = [
  { key: 'indications',      label: 'Indications & Usage' },
  { key: 'dosage',           label: 'Dosage & Administration' },
  { key: 'contraindications', label: 'Contraindications' },
  { key: 'warnings',         label: 'Warnings & Precautions' },
  { key: 'adverseEffects',   label: 'Adverse Effects' },
  { key: 'pregnancy',        label: 'Pregnancy & Lactation' },
  { key: 'storage',          label: 'Storage & Handling' },
]

function ChevronIcon({ open }) {
  return (
    <svg
      className={`dd-accordion-chevron${open ? ' open' : ''}`}
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
    .map((s, i) => <p key={i} className="dd-accordion-para">{s}</p>)
}

function AccordionItem({ sectionKey, label, content }) {
  const [open, setOpen] = useState(false)
  const id = `dd-section-${sectionKey}`

  return (
    <div className="dd-accordion-item">
      <button
        type="button"
        className="dd-accordion-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(prev => !prev)}
      >
        <span className="dd-accordion-label">{label}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div id={id} className="dd-accordion-body">
          {renderParagraphs(content)}
        </div>
      )}
    </div>
  )
}

export default function DrugAccordion({ drug }) {
  const visibleSections = SECTIONS.filter(s => drug[s.key])

  if (visibleSections.length === 0) return null

  return (
    <div className="dd-accordion">
      {visibleSections.map(s => (
        <AccordionItem
          key={s.key}
          sectionKey={s.key}
          label={s.label}
          content={drug[s.key]}
        />
      ))}
    </div>
  )
}
