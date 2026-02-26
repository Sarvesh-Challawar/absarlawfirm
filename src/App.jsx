import './App.css'
import Disclaimer from './components/Disclaimer/Disclaimer'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import PracticeAreas from './components/PracticeAreas/PracticeAreas'
import Footer from './components/Footer/Footer'

function App() {
  return (
    <>
      <Disclaimer />
      <Navbar />
      <main>
        <Hero />
        <About />
        <PracticeAreas />
      </main>
      <Footer />
    </>
  )
}

export default App

