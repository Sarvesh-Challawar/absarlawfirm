import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './People.css'

const ATTORNEYS = [
  {
    name: 'Mohammed Absar',
    role: 'Founder & Managing Partner',
    areas: 'Corporate & Commercial, Banking & Finance',
    bio: 'With over 25 years of practice, Mohammed Absar leads the firm with deep expertise in corporate transactions, regulatory advisory, and cross-border commercial matters.',
    initials: 'MA',
    education: [
      'LL.B., Faculty of Law, University of Delhi',
      'LL.M. (Corporate Law), National Law School of India University, Bangalore',
    ],
    phone: '+91 98100 00001',
    experience: '25+ years',
    details:
      'Mohammed founded Absar Law Company in 1999 after a distinguished career at two of India\'s top commercial law firms. He has advised on over 300 M&A transactions, led regulatory mandates before SEBI, RBI, and CCI, and is a frequent speaker at national law conferences. He is recognised as a leading lawyer in Chambers & Partners and Legal 500 India.',
  },
  {
    name: 'XYZ',
    role: 'Senior Partner',
    areas: 'Litigation & Arbitration',
    bio: 'XYZ has represented clients before the Supreme Court and various High Courts for over 18 years, specialising in complex commercial disputes and international arbitration.',
    initials: 'XY',
    education: [
      'B.A. LL.B. (Hons.), NALSAR University of Law, Hyderabad',
      'Diploma in International Arbitration, CIArb London',
    ],
    phone: '+91 98100 00002',
    experience: '18+ years',
    details:
      'XYZ joined the firm in 2007 and has since built one of the firm\'s strongest litigation practices. She has appeared in landmark cases involving contractual disputes, insolvency proceedings under the IBC, and ICC arbitrations seated in Singapore and London. She is an empanelled arbitrator with the Delhi High Court Arbitration Centre.',
  },
]

function People() {
  const navigate = useNavigate()
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
    <section id="people" className="people section">
      <div className="container">
        <p className="people__eyebrow">Our Team</p>
        <h2 className="section-title">The People</h2>
        <p className="section-subtitle">
          Our attorneys combine deep legal knowledge with practical experience, delivering
          counsel that is both strategically sound and commercially pragmatic.
        </p>

        <div className="people__grid">
          {ATTORNEYS.map(attorney => (
            <div key={attorney.name} className="people__card">
              <div className="people__avatar" aria-hidden="true">
                {attorney.initials}
              </div>
              <div className="people__info">
                <h3 className="people__name">{attorney.name}</h3>
                <p className="people__role">{attorney.role}</p>
                <p className="people__bio">{attorney.bio}</p>
              </div>
              <button
                className="people__profile-btn"
                onClick={() => setSelected(attorney)}
                aria-label={`View profile of ${attorney.name}`}
              >
                View Profile →
              </button>
            </div>
          ))}
        </div>

        <div className="people__cta-row">
          <button
            className="people__cta"
            onClick={() => navigate('/practice-areas')}
          >
            View Practice Areas →
          </button>
        </div>
      </div>

      {/* ── Modal overlay ── */}
      {selected && (
        <div
          className="people__modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Profile of ${selected.name}`}
          onClick={() => setSelected(null)}
          onKeyDown={handleKeyDown}
        >
          <div
            className="people__modal"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="people__modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close profile"
            >
              ✕
            </button>

            {/* Header */}
            <div className="people__modal-header">
              <div className="people__modal-avatar" aria-hidden="true">
                {selected.initials}
              </div>
              <div>
                <h2 className="people__modal-name">{selected.name}</h2>
                <p className="people__modal-role">{selected.role}</p>
                <p className="people__modal-areas">{selected.areas}</p>
              </div>
            </div>

            {/* Body */}
            <div className="people__modal-body">

              <div className="people__modal-section">
                <h4 className="people__modal-label">Experience</h4>
                <p className="people__modal-value">{selected.experience}</p>
              </div>

              <div className="people__modal-section">
                <h4 className="people__modal-label">Contact</h4>
                <a
                  href={`tel:${selected.phone.replace(/\s/g, '')}`}
                  className="people__modal-value people__modal-link"
                >
                  {selected.phone}
                </a>
              </div>

              <div className="people__modal-section people__modal-section--full">
                <h4 className="people__modal-label">Education</h4>
                <ul className="people__modal-edu">
                  {selected.education.map(e => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>

              <div className="people__modal-section people__modal-section--full">
                <h4 className="people__modal-label">About</h4>
                <p className="people__modal-detail">{selected.details}</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default People
