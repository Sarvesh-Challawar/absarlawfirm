import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'About Us',         path: '/about' },
  { label: 'People',           path: '/people' },
  { label: 'Practice Areas',   path: '/practice-areas' },
  { label: 'Knowledge Center', path: '/knowledge-center' },
  { label: 'Offices',          path: '/offices' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handlePageNav(path) {
    setMenuOpen(false)
    navigate(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function renderLink(link, mobile = false) {
    const base = mobile ? 'navbar__mobile-link' : 'navbar__link'
    const active = pathname === link.path ? ' navbar__link--active' : ''
    return (
      <button
        className={`${base}${active} navbar__link--btn`}
        onClick={() => handlePageNav(link.path)}
        aria-current={pathname === link.path ? 'page' : undefined}
      >
        {link.label}
      </button>
    )
  }

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">

        {/* Logo */}
        <button
          className="navbar__logo"
          aria-label="Absar Law Company — Home"
          onClick={() => handlePageNav('/')}
        >
          <span className="navbar__logo-main">ABSAR</span>
          <span className="navbar__logo-sub">LAW COMPANY</span>
        </button>

        {/* Desktop nav */}
        <nav className="navbar__nav" aria-label="Primary navigation">
          <ul className="navbar__links">
            {NAV_LINKS.map(link => (
              <li key={link.path}>
                {renderLink(link)}
              </li>
            ))}
          </ul>
        </nav>

        {/* Hamburger button */}
        <button
          className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(prev => !prev)}
        >
          <span className="navbar__bar" />
          <span className="navbar__bar" />
          <span className="navbar__bar" />
        </button>
      </div>

      {/* Mobile menu */}
      <nav
        id="mobile-menu"
        className={`navbar__mobile${menuOpen ? ' navbar__mobile--open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <ul className="navbar__mobile-links">
          {NAV_LINKS.map(link => (
            <li key={link.path}>
              {renderLink(link, true)}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
