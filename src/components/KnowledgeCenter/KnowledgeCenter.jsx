import { useEffect } from 'react'
import './KnowledgeCenter.css'

const ARTICLES = [
  {
    category: 'Corporate Law',
    title: 'Key Amendments to the Companies Act: What Boards Need to Know',
    date: 'February 2026',
    excerpt:
      'Recent legislative changes have introduced significant compliance obligations for listed and unlisted companies. We break down what directors and CFOs must act on immediately.',
  },
  {
    category: 'Intellectual Property',
    title: 'Protecting Your Brand in the Digital Age: A Trademark Primer',
    date: 'January 2026',
    excerpt:
      'With the rise of e-commerce and social media, brand protection demands a proactive multi-jurisdictional strategy. This guide outlines the essential steps for Indian businesses.',
  },
  {
    category: 'Employment Law',
    title: 'The Four Labour Codes: Compliance Roadmap for Employers',
    date: 'January 2026',
    excerpt:
      'India\'s consolidation of 29 central labour laws into four codes reshapes obligations around wages, social security, industrial relations, and occupational safety.',
  },
  {
    category: 'Real Estate',
    title: 'RERA After Five Years: Lessons for Developers and Buyers',
    date: 'December 2025',
    excerpt:
      'A review of landmark RERA rulings and their practical implications for project timelines, refund obligations, and homebuyer remedies in 2026.',
  },
  {
    category: 'Technology & TMT',
    title: "India's Digital Personal Data Protection Act: Compliance Checklist",
    date: 'December 2025',
    excerpt:
      'With the DPDP Act now in force, businesses processing personal data of Indian citizens must implement consent frameworks, data localisation controls, and grievance mechanisms.',
  },
  {
    category: 'Banking & Finance',
    title: 'RBI Regulatory Updates: What Lenders and Borrowers Should Know',
    date: 'November 2025',
    excerpt:
      'A summary of the Reserve Bank of India\'s latest circulars on stressed asset resolution, co-lending models, and digital lending norms affecting NBFCs and banks.',
  },
]

function KnowledgeCenter() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <section id="knowledge-center" className="knowledge section">
      <div className="container">
        <p className="knowledge__eyebrow">Insights & Publications</p>
        <h2 className="section-title">Knowledge Center</h2>
        <p className="section-subtitle">
          Our attorneys regularly publish analysis on evolving legal developments across
          practice areas — helping clients stay informed and ahead of regulatory change.
        </p>

        <div className="knowledge__grid">
          {ARTICLES.map(article => (
            <article key={article.title} className="knowledge__card">
              <div className="knowledge__card-header">
                <span className="knowledge__category">{article.category}</span>
                <span className="knowledge__date">{article.date}</span>
              </div>
              <h3 className="knowledge__title">{article.title}</h3>
              <p className="knowledge__excerpt">{article.excerpt}</p>
              <span className="knowledge__read-more">Read article →</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default KnowledgeCenter
