import { Routes, Route } from 'react-router-dom'
import './App.css'
import Disclaimer from './components/Disclaimer/Disclaimer'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import PracticeAreas from './components/PracticeAreas/PracticeAreas'
import Footer from './components/Footer/Footer'

function ComingSoon({ title }) {
  return (
    <div className="placeholder section">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">This section is coming soon. Check back later.</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <Disclaimer />
      <Navbar />
      <main>
        <Routes>
          <Route path="/"                   element={<Hero />} />
          <Route path="/about"              element={<About />} />
          <Route path="/practice-areas"     element={<PracticeAreas />} />
          <Route path="/people"             element={<ComingSoon title="Our People" />} />
          <Route path="/knowledge-center"   element={<ComingSoon title="Knowledge Center" />} />
          <Route path="/offices"            element={<ComingSoon title="Our Offices" />} />
          <Route path="*"                   element={<Hero />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App

