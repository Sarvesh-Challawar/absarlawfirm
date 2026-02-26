import { useState, useEffect } from 'react'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'About Us',        href: '#about' },
  { label: 'People',          href: '#people' },
  { label: 'Practice Areas',  href: '#practice-areas' },
  { label: 'Knowledge Center',href: '#knowledge-center' },
  { label: 'Offices',         href: '#offices' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleNavClick() {
    setMenuOpen(false)
  }

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">

        {/* Logo */}
        <a href="#" className="navbar__logo" aria-label="Absar Law Company — Home">
          <span className="navbar__logo-main">ABSAR</span>
          <span className="navbar__logo-sub">LAW COMPANY</span>
        </a>

        {/* Desktop nav */}
        <nav className="navbar__nav" aria-label="Primary navigation">
          <ul className="navbar__links">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <a href={link.href} className="navbar__link">
                  {link.label}
                </a>
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
            <li key={link.href}>
              <a
                href={link.href}
                className="navbar__mobile-link"
                onClick={handleNavClick}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
