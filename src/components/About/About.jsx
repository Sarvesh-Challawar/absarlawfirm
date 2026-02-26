import './About.css'

const STATS = [
  { value: '25+', label: 'Years of Practice' },
  { value: '500+', label: 'Cases Handled' },
  { value: '12', label: 'Practice Areas' },
  { value: '98%', label: 'Client Satisfaction' },
]

function About() {
  return (
    <section id="about" className="about section">
      <div className="container">
        <div className="about__grid">

          {/* Text */}
          <div className="about__content">
            <p className="about__eyebrow">Who We Are</p>
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
            <a href="#practice-areas" className="about__cta">
              Explore Our Practice Areas →
            </a>
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
