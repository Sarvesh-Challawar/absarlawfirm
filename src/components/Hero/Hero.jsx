import { useState, useEffect } from 'react'
import './Hero.css'

const SLIDES = [
  {
    tagline: 'Excellence in Legal Counsel',
    sub: 'Trusted advisors delivering practical, solution-seeking legal support for every client.',
  },
  {
    tagline: 'Decades of Legal Expertise',
    sub: 'A full-service law firm with a strong presence across multiple jurisdictions.',
  },
  {
    tagline: 'Committed to Justice & Integrity',
    sub: 'Upholding the highest standards of professional ethics and client confidentiality.',
  },
  {
    tagline: 'Comprehensive Legal Solutions',
    sub: 'From corporate law to litigation — we handle matters of every complexity.',
  },
]

function Hero() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(false)
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % SLIDES.length)
        setAnimating(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  function goTo(index) {
    setAnimating(false)
    setTimeout(() => {
      setCurrent(index)
      setAnimating(true)
    }, 300)
  }

  const slide = SLIDES[current]

  return (
    <section className="hero" aria-label="Hero">
      <div className="hero__overlay" />
      <div className="hero__content container">
        <div className={`hero__text${animating ? ' hero__text--visible' : ''}`}>
          <p className="hero__eyebrow">Absar Law Company</p>
          <h1 className="hero__tagline">{slide.tagline}</h1>
          <p className="hero__sub">{slide.sub}</p>
          <div className="hero__actions">
            <a href="#practice-areas" className="hero__btn hero__btn--primary">
              Our Practice Areas
            </a>
            <a href="#about" className="hero__btn hero__btn--secondary">
              About the Firm
            </a>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="hero__dots" aria-label="Slide indicators">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero__dot${i === current ? ' hero__dot--active' : ''}`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === current ? 'true' : 'false'}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* Scroll cue */}
      <a href="#about" className="hero__scroll-cue" aria-label="Scroll down">
        <span className="hero__scroll-arrow" />
      </a>
    </section>
  )
}

export default Hero
