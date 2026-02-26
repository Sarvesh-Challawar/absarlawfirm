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

function App() {
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

