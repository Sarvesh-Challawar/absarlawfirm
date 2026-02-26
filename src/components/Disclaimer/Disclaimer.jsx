import { useState, useEffect } from 'react'
import './Disclaimer.css'

function Disclaimer() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const agreed = localStorage.getItem('absar_disclaimer_agreed')
    if (!agreed) {
      setVisible(true)
    }
  }, [])

  function handleAgree() {
    localStorage.setItem('absar_disclaimer_agreed', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="disclaimer-overlay" role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
      <div className="disclaimer-box">
        <div className="disclaimer-header">
          <h2 id="disclaimer-title" className="disclaimer-logo-text">ABSAR LAW COMPANY</h2>
        </div>

        <div className="disclaimer-body">
          <h3 className="disclaimer-heading">DISCLAIMER</h3>
          <p className="disclaimer-intro">
            The current rules of the Bar Council restrict / prohibit law firms from advertising
            and soliciting work through communication in the public domain. This website has been
            designed solely for the purposes of dissemination of basic information about
            Absar Law Company, which is made available on the specific request of the visitor/user.
            By clicking on <strong>'Agree and Enter'</strong>, the visitor acknowledges that:
          </p>
          <ol className="disclaimer-list">
            <li>the contents of this website do not amount to advertising or solicitation;</li>
            <li>
              the information provided on the website is meant only for the visitor's understanding
              about our activities and who we are, on their own volition;
            </li>
            <li>
              the contents of this website do not constitute, and shall not be construed as,
              legal advice or a substitute for legal advice;
            </li>
            <li>
              the use of this website is completely at the user's own volition and shall not
              create or amount to an attorney-client relationship;
            </li>
            <li>
              Absar Law Company is not liable for the consequence of any action or decision
              taken by the visitor by relying on the contents of this website;
            </li>
            <li>
              Absar Law Company does not assume any liability for the interpretation or use of
              the information provided on this website and does not offer any warranty, either
              express or implied;
            </li>
            <li>
              the contents of this website are the property of Absar Law Company and the visitor
              is not authorised to use any part thereof without the express prior written consent
              of Absar Law Company.
            </li>
          </ol>
        </div>

        <div className="disclaimer-footer">
          <button className="disclaimer-btn" onClick={handleAgree}>
            Agree and Enter
          </button>
        </div>
      </div>
    </div>
  )
}

export default Disclaimer
