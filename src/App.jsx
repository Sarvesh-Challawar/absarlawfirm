import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Disclaimer from './components/Disclaimer/Disclaimer'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import PracticeAreas from './components/PracticeAreas/PracticeAreas'
import People from './components/People/People'
import KnowledgeCenter from './components/KnowledgeCenter/KnowledgeCenter'
import Offices from './components/Offices/Offices'
import PrivacyPolicy from './components/PrivacyPolicy/PrivacyPolicy'
import TermsOfUse from './components/TermsOfUse/TermsOfUse'
import Footer from './components/Footer/Footer'
import { msalInstance, msalReady } from './lib/msalConfig'

function App() {
  // Handle the MSAL redirect response once on app mount.
  // This completes the auth-code exchange when the browser returns from
  // Microsoft login and restores the Knowledge Center admin panel.
  useEffect(() => {
    msalReady
      .then(() => msalInstance.handleRedirectPromise())
      .then(authResult => {
        if (authResult) {
          // Returned from Microsoft login — restore saved route
          const returnPath = sessionStorage.getItem('msal_return_path')
          if (returnPath) {
            sessionStorage.removeItem('msal_return_path')
            window.location.hash = returnPath
          }
          // msal_admin_intent and msal_pw_ok are read by KnowledgeCenter's own useEffect
        } else {
          // Normal load — clear any stale intent keys in case a previous redirect was abandoned
          const hasIntent = sessionStorage.getItem('msal_admin_intent')
          if (!hasIntent) {
            sessionStorage.removeItem('msal_pw_ok')
            sessionStorage.removeItem('msal_return_path')
          }
        }
      })
      .catch(e => {
        console.error('[MSAL] handleRedirectPromise error:', e)
        sessionStorage.removeItem('msal_admin_intent')
        sessionStorage.removeItem('msal_pw_ok')
        sessionStorage.removeItem('msal_return_path')
      })
  }, [])

  return (
    <>
      <Disclaimer />
      <Navbar />
      <main>
        <Routes>
          <Route path="/"                 element={<Hero />} />
          <Route path="/about"            element={<About />} />
          <Route path="/practice-areas"   element={<PracticeAreas />} />
          <Route path="/people"           element={<People />} />
          <Route path="/knowledge-center" element={<KnowledgeCenter />} />
          <Route path="/offices"          element={<Offices />} />
          <Route path="/privacy-policy"   element={<PrivacyPolicy />} />
          <Route path="/terms-of-use"     element={<TermsOfUse />} />
          <Route path="*"                 element={<Hero />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
