import { useNavigate } from 'react-router-dom'
import './Footer.css'

const QUICK_LINKS = [
  { label: 'About Us',         path: '/about' },
  { label: 'People',           path: '/people' },
  { label: 'Practice Areas',   path: '/practice-areas' },
  { label: 'Knowledge Center', path: '/knowledge-center' },
  { label: 'Offices',          path: '/offices' },
]

const PRACTICE_LINKS = [
  'Corporate & Commercial',
  'Litigation & Arbitration',
  'Real Estate',
  'Employment Law',
  'Intellectual Property',
  'Banking & Finance',
]

const SOCIAL = [
  { label: 'LinkedIn',  href: '#', icon: 'in' },
  { label: 'Twitter',   href: '#', icon: '𝕏' },
  { label: 'Facebook',  href: '#', icon: 'f' },
]

function Footer() {
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  function handleNav(path) {
    navigate(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer" id="offices">
      <div className="footer__main">
        <div className="container footer__grid">

          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <span className="footer__logo-main">ABSAR</span>
              <span className="footer__logo-sub">LAW COMPANY</span>
            </div>
            <p className="footer__tagline">
              Excellence in Legal Counsel.<br />
              Trusted advisors. Proven results.
            </p>
            <div className="footer__social">
              {SOCIAL.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  className="footer__social-link"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h4 className="footer__col-title">Quick Links</h4>
            <ul className="footer__list">
              {QUICK_LINKS.map(l => (
                <li key={l.path}>
                  <button
                    className="footer__link footer__link--btn"
                    onClick={() => handleNav(l.path)}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Practice Areas */}
          <div className="footer__col">
            <h4 className="footer__col-title">Practice Areas</h4>
            <ul className="footer__list">
              {PRACTICE_LINKS.map(p => (
                <li key={p}>
                  <button
                    className="footer__link footer__link--btn"
                    onClick={() => handleNav('/practice-areas')}
                  >
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Offices */}
          <div className="footer__col">
            <h4 className="footer__col-title">Contact Us</h4>
            <address className="footer__address">
              <p>
                <strong>Head Office</strong><br />
                123 Legal Avenue, Suite 400<br />
                New Delhi, India – 110001
              </p>
              <p>
                <a href="tel:+911234567890" className="footer__link">+91 12345 67890</a>
              </p>
              <p>
                <a href="mailto:info@absarlaw.com" className="footer__link">info@absarlaw.com</a>
              </p>
            </address>
          </div>

        </div>
      </div>

      {/* Disclaimer strip */}
      <div className="footer__disclaimer-strip">
        <div className="container">
          <p>
            <strong>Disclaimer:</strong> The Bar Council of India does not permit advertisement or
            solicitation by advocates in any form or manner. By accessing this website you
            acknowledge and confirm that you are seeking information relating to Absar Law Company
            of your own accord and there has been no advertisement, personal communication,
            solicitation, invitation or inducement of any sort whatsoever from Absar Law Company
            or any of its members to solicit any work through this website.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {year} Absar Law Company. All rights reserved.</p>
          <div className="footer__bottom-links">
            <a href="#" className="footer__link">Privacy Policy</a>
            <span aria-hidden="true">|</span>
            <a href="#" className="footer__link">Terms of Use</a>
            <span aria-hidden="true">|</span>
            <a href="#" className="footer__link">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
