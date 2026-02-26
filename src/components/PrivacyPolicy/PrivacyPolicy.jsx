import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './PrivacyPolicy.css'

const LAST_UPDATED = '1 January 2025'

const SECTIONS = [
  {
    title: '1. Introduction',
    content: `Absar Law Company ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this policy carefully. If you disagree with its terms, please discontinue use of the site.`,
  },
  {
    title: '2. Information We Collect',
    content: `We may collect information about you in a variety of ways. The information we may collect on the site includes:`,
    list: [
      'Personal Data: Name, email address, telephone number, and other contact details you voluntarily provide when you contact us via forms or email.',
      'Derivative Data: Information our servers automatically collect when you access the site, such as your IP address, browser type, operating system, access times, and referring URLs.',
      'Cookies and Tracking Technologies: We may use cookies, web beacons, and similar technologies to help customise the site and improve your experience.',
    ],
  },
  {
    title: '3. Use of Your Information',
    content: `Having accurate information about you permits us to provide a smooth, efficient experience. Specifically, we may use information collected about you to:`,
    list: [
      'Respond to your inquiries and contact requests.',
      'Send administrative information, such as updates to our terms and policies.',
      'Monitor and analyse usage and trends to improve your experience with the site.',
      'Comply with applicable legal obligations.',
    ],
  },
  {
    title: '4. Disclosure of Your Information',
    content: `We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except in the following limited circumstances:`,
    list: [
      "By Law or to Protect Rights: If we believe disclosure is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.",
      'Third-Party Service Providers: We may share your information with third parties that perform services for us, such as hosting, data analytics, and IT support, under strict confidentiality obligations.',
      'Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.',
    ],
  },
  {
    title: '5. Security of Your Information',
    content: `We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the information you provide, please be aware that no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or misuse.`,
  },
  {
    title: '6. Cookies',
    content: `We may use cookies and similar tracking technologies to access or store information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our site.`,
  },
  {
    title: '7. Links to Third-Party Sites',
    content: `This site may contain links to third-party websites, including our social media pages. These linked sites are not under our control, and we are not responsible for the privacy practices of such sites. We encourage you to be aware when you leave our site and to read the privacy policies of each website that collects personally identifiable information.`,
  },
  {
    title: '8. Children\'s Privacy',
    content: `Our site is not directed to children under the age of 18. We do not knowingly collect personally identifiable information from children. If you become aware that a child has provided us with personal data, please contact us immediately.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last Updated" date of this policy. You are encouraged to periodically review this policy to stay informed of updates.`,
  },
  {
    title: '10. Contact Us',
    content: `If you have questions or comments about this Privacy Policy, please contact us at:`,
    contact: true,
  },
]

function PrivacyPolicy() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <section className="policy section">
      <div className="container">
        <p className="policy__eyebrow">Legal</p>
        <h1 className="section-title">Privacy Policy</h1>
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

export default PrivacyPolicy
