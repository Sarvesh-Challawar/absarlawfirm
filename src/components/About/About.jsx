import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './About.css'

const STATS = [
  { value: '5+', label: 'Years of Practice' },
  { value: '50+', label: 'Cases Handled' },
  { value: '4', label: 'Practice Areas' },
  { value: '98%', label: 'Client Satisfaction' },
]

function About() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  return (
    <section id="about" className="about section">
      <div className="container">
        <div className="about__grid">

          {/* Text */}
          <div className="about__content">
            <br></br>
            <h2 className="section-title">About Absar Law Company</h2>
            <p className="about__body">
              Absar Law Company is a premier full-service law firm committed to delivering
              practical, solution-oriented legal counsel. With decades of experience across
              diverse practice areas, our attorneys bring deep expertise and an unwavering
              commitment to client success.
            </p>
            <p className="about__body">
              We serve a broad clientele — from individuals and emerging businesses to
              established corporations and government bodies — providing representation
              characterised by integrity, diligence, and professionalism.
            </p>
            <button
              className="about__cta"
              onClick={() => navigate('/practice-areas')}
            >
              Explore Our Practice Areas →
            </button>
          </div>

          {/* Stats */}
          <div className="about__stats">
            {STATS.map(stat => (
              <div key={stat.label} className="about__stat">
                <span className="about__stat-value">{stat.value}</span>
                <span className="about__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default About
