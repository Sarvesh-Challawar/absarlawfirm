import { useEffect } from 'react'
import './PracticeAreas.css'

const AREAS = [
  {
    icon: '⚖️',
    title: 'Corporate & Commercial',
    desc: 'Mergers, acquisitions, joint ventures, corporate restructuring, and commercial contracts.',
  },
  {
    icon: '🏛️',
    title: 'Litigation & Arbitration',
    desc: 'Representation in civil, commercial, and international arbitration proceedings.',
  },
  {
    icon: '🏠',
    title: 'Real Estate',
    desc: 'Property transactions, development agreements, title due diligence, and landlord-tenant matters.',
  },
  {
    icon: '💼',
    title: 'Employment Law',
    desc: 'Workplace advisory, employment contracts, HR compliance, and dispute resolution.',
  },
  {
    icon: '🛡️',
    title: 'Intellectual Property',
    desc: 'Trademarks, patents, copyrights, licensing, and IP enforcement strategies.',
  },
  {
    icon: '🌐',
    title: 'Technology & TMT',
    desc: 'Fintech, data privacy, cybersecurity law, and regulatory compliance for tech businesses.',
  },
  {
    icon: '🔍',
    title: 'White Collar Crime',
    desc: 'Fraud investigations, anti-corruption compliance, and criminal defence for corporations.',
  },
  {
    icon: '✈️',
    title: 'Aviation & Defence',
    desc: 'Regulatory matters, aircraft financing, leasing, and government contract advisory.',
  },
  {
    icon: '💰',
    title: 'Banking & Finance',
    desc: 'Lending, structured finance, regulatory compliance, and financial institution advisory.',
  },
  {
    icon: '🌿',
    title: 'Environmental Law',
    desc: 'Environmental clearances, compliance advisory, and green energy project support.',
  },
  {
    icon: '🏥',
    title: 'Healthcare & Life Sciences',
    desc: 'Regulatory approvals, clinical trial agreements, and healthcare institution advisory.',
  },
  {
    icon: '📋',
    title: 'Tax & Revenue',
    desc: 'Direct and indirect tax advisory, dispute resolution, and transfer pricing matters.',
  },
]

function PracticeAreas() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  return (
    <section id="practice-areas" className="practice section">
      <div className="container">
        <p className="practice__eyebrow">What We Do</p>
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
              <span className="practice__card-link">Learn more →</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PracticeAreas
