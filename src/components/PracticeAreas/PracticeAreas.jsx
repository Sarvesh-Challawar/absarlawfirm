import { useEffect, useState } from 'react'
import './PracticeAreas.css'

const AREAS = [
  {
    icon: '🏛️',
    title: 'Litigation & Arbitration',
    desc: 'Representation in civil, commercial, and international arbitration proceedings.',
    practice: 'Our litigation practice covers civil, commercial, constitutional, and criminal matters across all forums including district courts, High Courts, and the Supreme Court of India. We also handle domestic and international arbitration under ICC, SIAC, LCIA, and ad hoc rules.',
    execution: 'We begin each matter with a rigorous case assessment, identifying strengths, risks, and strategic alternatives. Our teams deploy deep procedural knowledge to manage timelines effectively, file targeted applications, and leverage interim reliefs where warranted. Every hearing is backed by thorough preparation and well-researched submissions.',
    strengths: [
      'Appearances before Supreme Court, all High Courts, and specialised tribunals',
      'International arbitration under ICC, SIAC, LCIA, and UNCITRAL rules',
      'Emergency arbitration and enforcement of foreign awards under the New York Convention',
      'Strong track record in insolvency and IBC-related litigation',
    ],
    areaOfFocus: [
      'Commercial contract disputes',
      'Shareholder and joint venture disputes',
      'Insolvency and restructuring proceedings',
      'Investment treaty and cross-border arbitration',
      'White collar crime and regulatory investigations',
    ],
  },
  {
    icon: '🏠',
    title: 'Real Estate',
    desc: 'Property transactions, development agreements, title due diligence, and landlord-tenant matters.',
    practice: 'Our real estate practice advises on the full lifecycle of property transactions — from acquisition and development to leasing, financing, and dispute resolution. We act for developers, funds, corporates, and government bodies across residential, commercial, industrial, and mixed-use projects.',
    execution: 'We conduct comprehensive title searches and due diligence to identify encumbrances, litigation risks, and regulatory gaps. Our team structures transactions to optimise stamp duty, registration, and tax exposure, and negotiates transaction documents to protect client interests at every stage.',
    strengths: [
      'End-to-end transaction management for large-scale development projects',
      'RERA compliance advisory for developers and homebuyers',
      'Structuring of REITs, PropTech transactions, and real estate funds',
      'Landlord-tenant disputes and eviction proceedings',
    ],
    areaOfFocus: [
      'Sale, purchase, and joint development agreements',
      'Commercial and retail leasing',
      'Construction contracts and EPC disputes',
      'Real estate financing and mortgage enforcement',
      'Regularisation and land acquisition matters',
    ],
  },
]

function PracticeAreas() {
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selected])

  function handleKeyDown(e) {
    if (e.key === 'Escape') setSelected(null)
  }

  return (
    <section id="practice-areas" className="practice section">
      <div className="container">
        <br></br>
        <h2 className="section-title">Practice Areas</h2>
        <p className="section-subtitle">
          Our attorneys bring focused expertise across a broad spectrum of legal disciplines,
          ensuring comprehensive support for every client need.
        </p>

        <div className="practice__grid">
          {AREAS.map(area => (
            <div key={area.title} className="practice__card">
              <span className="practice__icon" aria-hidden="true">{area.icon}</span>
              <h3 className="practice__card-title">{area.title}</h3>
              <p className="practice__card-desc">{area.desc}</p>
              <button
                className="practice__card-link"
                onClick={() => setSelected(area)}
                aria-label={`Learn more about ${area.title}`}
              >
                Learn more →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal ── */}
      {selected && (
        <div
          className="practice__modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          onClick={() => setSelected(null)}
          onKeyDown={handleKeyDown}
        >
          <div
            className="practice__modal"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              className="practice__modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Header */}
            <div className="practice__modal-header">
              <span className="practice__modal-icon" aria-hidden="true">{selected.icon}</span>
              <h2 className="practice__modal-title">{selected.title}</h2>
            </div>

            {/* Scrollable body */}
            <div className="practice__modal-body">

              <div className="practice__modal-section">
                <h3 className="practice__modal-label">The Practice</h3>
                <p className="practice__modal-text">{selected.practice}</p>
              </div>

              <div className="practice__modal-section">
                <h3 className="practice__modal-label">The Execution</h3>
                <p className="practice__modal-text">{selected.execution}</p>
              </div>

              <div className="practice__modal-section">
                <h3 className="practice__modal-label">Our Strengths</h3>
                <ul className="practice__modal-list">
                  {selected.strengths.map(s => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="practice__modal-section">
                <h3 className="practice__modal-label">Area of Focus</h3>
                <ul className="practice__modal-list practice__modal-list--tags">
                  {selected.areaOfFocus.map(f => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default PracticeAreas
