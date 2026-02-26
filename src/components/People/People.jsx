import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './People.css'

const ATTORNEYS = [
  {
    name: 'Mohammed Absar',
    role: 'Founder & Managing Partner',
    areas: 'Corporate & Commercial, Banking & Finance',
    bio: 'With over 25 years of practice, Mohammed Absar leads the firm with deep expertise in corporate transactions, regulatory advisory, and cross-border commercial matters.',
    initials: 'MA',
  },
  {
    name: 'Priya Sharma',
    role: 'Senior Partner',
    areas: 'Litigation & Arbitration',
    bio: 'Priya has represented clients before the Supreme Court and various High Courts for over 18 years, specialising in complex commercial disputes and international arbitration.',
    initials: 'PS',
  },
  {
    name: 'Rohit Verma',
    role: 'Partner',
    areas: 'Real Estate & Environmental Law',
    bio: 'Rohit advises leading developers and government bodies on large-scale real estate projects, infrastructure transactions, and environmental clearance matters.',
    initials: 'RV',
  },
  {
    name: 'Aisha Khan',
    role: 'Partner',
    areas: 'Intellectual Property & Technology',
    bio: 'Aisha leads the firm\'s IP and TMT practice, advising startups, tech companies, and multinationals on trademark, patent, data protection, and regulatory compliance.',
    initials: 'AK',
  },
  {
    name: 'Sanjay Mehta',
    role: 'Associate Partner',
    areas: 'Tax & Revenue',
    bio: 'Sanjay brings 12 years of experience in direct and indirect tax advisory, transfer pricing disputes, and representing clients before tax tribunals across India.',
    initials: 'SM',
  },
  {
    name: 'Deepika Nair',
    role: 'Associate Partner',
    areas: 'Employment Law & White Collar Crime',
    bio: 'Deepika advises corporates on employment compliance, internal investigations, anti-corruption programmes, and handles sensitive white collar matters.',
    initials: 'DN',
  },
]

function People() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

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
                <p className="people__areas">{attorney.areas}</p>
                <p className="people__bio">{attorney.bio}</p>
              </div>
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
    </section>
  )
}

export default People
