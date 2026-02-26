import { useEffect } from 'react'
import './Offices.css'

const OFFICES = [
  {
    city: 'Hyderabad',
    type: 'Head Office',
    address: ['Shah-Ali-Banda', 'Lal-Darwaza', 'Hyderabad - 500 033'],
    phone: '+91 12345 67890',
    email: 'absarlarfirm.hyderabad@gmail.com',
    hours: 'Mon - Fri: 9:30 am - 5:30 pm',
  },
]

function Offices() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <section id="offices" className="offices section">
      <div className="container">
        <br></br>
        <h2 className="section-title">Our Offices</h2>
        <p className="section-subtitle">
          With offices across India's major commercial centres, Absar Law Company is
          positioned to deliver seamless legal support wherever you operate.
        </p>

        <div className="offices__grid">
          {OFFICES.map(office => (
            <div key={office.city} className="offices__card">
              <div className="offices__card-header">
                <h3 className="offices__city">{office.city}</h3>
                <span className="offices__type">{office.type}</span>
              </div>

              <address className="offices__address">
                {office.address.map(line => (
                  <span key={line}>{line}</span>
                ))}
              </address>

              <ul className="offices__details">
                <li>
                  <span className="offices__detail-label" aria-label="Phone">📞</span>
                  <a href={`tel:${office.phone.replace(/\s/g, '')}`} className="offices__detail-link">
                    {office.phone}
                  </a>
                </li>
                <li>
                  <span className="offices__detail-label" aria-label="Email">✉</span>
                  <a href={`mailto:${office.email}`} className="offices__detail-link">
                    {office.email}
                  </a>
                </li>
                <li>
                  <span className="offices__detail-label" aria-label="Hours">🕐</span>
                  <span className="offices__hours">{office.hours}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        {/* General contact strip */}
        <div className="offices__contact-strip">
          <div className="offices__contact-strip-inner">
            <p className="offices__contact-label">General Enquiries</p>
            <a href="tel:+911145678900" className="offices__contact-link">+91 11 4567 8900</a>
            <span className="offices__contact-divider" aria-hidden="true">|</span>
            <a href="mailto:info@absarlaw.com" className="offices__contact-link">info@absarlaw.com</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Offices
