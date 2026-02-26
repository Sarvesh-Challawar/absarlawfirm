import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './TermsOfUse.css'

const LAST_UPDATED = '1 January 2025'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing and using the Absar Law Company website ("Site"), you accept and agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please refrain from using this Site. We reserve the right to modify these terms at any time, and such modifications will be effective immediately upon posting.`,
  },
  {
    title: '2. No Solicitation or Advertisement',
    content: `As required by the Bar Council of India Rules, this Site is not intended to be a source of advertising or solicitation. The information provided on this Site is purely for the purpose of providing general information about Absar Law Company and is not intended to create, and receipt of it does not constitute, an advocate–client relationship.`,
  },
  {
    title: '3. No Legal Advice',
    content: `The content on this Site is provided for general informational purposes only. It does not constitute legal advice and should not be relied upon as such. You should consult a qualified legal professional before taking any action based on information found on this Site. Absar Law Company expressly disclaims all liability for actions taken or not taken based on the contents of this Site.`,
  },
  {
    title: '4. Intellectual Property',
    content: `All content on this Site — including but not limited to text, graphics, logos, images, and software — is the property of Absar Law Company and is protected under applicable Indian and international intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our prior written consent, except for:`,
    list: [
      'Personal, non-commercial use for reference purposes.',
      'Sharing with attribution via standard hyperlinking to this Site.',
    ],
  },
  {
    title: '5. Permitted Use',
    content: `You agree to use this Site only for lawful purposes and in a manner that does not infringe the rights of others. You must not:`,
    list: [
      'Use the Site in any way that violates applicable local, national, or international laws or regulations.',
      'Transmit unsolicited or unauthorised advertising or promotional material.',
      'Attempt to gain unauthorised access to any part of the Site or its related systems.',
      'Engage in any conduct that restricts or inhibits anyone\'s use or enjoyment of the Site.',
    ],
  },
  {
    title: '6. Third-Party Links',
    content: `This Site may contain links to third-party websites for your convenience and information. These links do not signify our endorsement of those websites or their content. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.`,
  },
  {
    title: '7. Disclaimer of Warranties',
    content: `This Site is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components.`,
  },
  {
    title: '8. Limitation of Liability',
    content: `To the fullest extent permitted by law, Absar Law Company, its partners, associates, and employees shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your access to or use of — or inability to access or use — the Site or any content thereon.`,
  },
  {
    title: '9. Governing Law',
    content: `These Terms of Use shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.`,
  },
  {
    title: '10. Contact Us',
    content: `If you have any questions about these Terms of Use, please contact us at:`,
    contact: true,
  },
]

function TermsOfUse() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <section className="policy section">
      <div className="container">
        <p className="policy__eyebrow">Legal</p>
        <h1 className="section-title">Terms of Use</h1>
        <p className="policy__meta">Last updated: {LAST_UPDATED}</p>

        <div className="policy__body">
          {SECTIONS.map(sec => (
            <div key={sec.title} className="policy__section">
              <h2 className="policy__section-title">{sec.title}</h2>
              <p className="policy__text">{sec.content}</p>
              {sec.list && (
                <ul className="policy__list">
                  {sec.list.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {sec.contact && (
                <address className="policy__contact">
                  <p><strong>Absar Law Company</strong></p>
                  <p>123 Legal Avenue, Suite 400, New Delhi, India – 110001</p>
                  <p>
                    Email:{' '}
                    <a href="mailto:info@absarlaw.com" className="policy__link">
                      info@absarlaw.com
                    </a>
                  </p>
                  <p>
                    Phone:{' '}
                    <a href="tel:+911234567890" className="policy__link">
                      +91 12345 67890
                    </a>
                  </p>
                </address>
              )}
            </div>
          ))}
        </div>

        <div className="policy__back">
          <button className="policy__back-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    </section>
  )
}

export default TermsOfUse
