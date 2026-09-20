import Hero from '../components/Hero'
import About from '../components/About'
import Projects from '../components/Projects'
import Gallery from '../components/Gallery'
import Events from '../components/Events'
import Teachers from '../components/Teachers'
import Museum from '../components/Museum'
import School from '../components/School'
import Credits from '../components/Credits'
import Reveal from '../components/Reveal'

function Home() {
  return (
    <main>

      <Hero />

      <Reveal>
        <About />
      </Reveal>

      <Reveal>
        <Projects />
      </Reveal>

      <Reveal>
        <Gallery />
      </Reveal>

      <Reveal>
        <Events />
      </Reveal>

      <Reveal>
        <Teachers />
      </Reveal>

      <Reveal direction="left">
        <Museum />
      </Reveal>

      <Reveal direction="right">
        <School />
      </Reveal>

      <Reveal>
        <Credits />
      </Reveal>

    </main>
  )
}

export default Home