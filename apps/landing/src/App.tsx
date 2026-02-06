import Header from './components/Header'
import Hero from './components/Hero'
import FrameworkLogos from './components/FrameworkLogos'
import Features from './components/Features'
import CodeShowcase from './components/CodeShowcase'
import CliDemo from './components/CliDemo'
import ComponentPreview from './components/ComponentPreview'
import Cta from './components/Cta'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <main>
        <Hero />
        <FrameworkLogos />
        <Features />
        <CodeShowcase />
        <CliDemo />
        <ComponentPreview />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}

export default App
