import './Hero.css'

function Hero() {
  return (
    <section className="hero" id="inicio">

      <div className="hero-decoration hero-decoration-blue"></div>
      <div className="hero-decoration hero-decoration-orange"></div>

      <div className="hero-content">

        <span className="hero-tag">
          FIRJAN SESI MARACANÃ
        </span>

        <h1>
          ARTE
          <br />
          TRANSFORMA
          <br />
          <span>REALIDADES</span>
        </h1>

        <p>
          O ARTE MAKER é um espaço onde estudantes criam,
          experimentam e compartilham arte.
          Um projeto feito de ideias, expressão e novos futuros.
        </p>

        <a href="#projeto" className="hero-button">
          Conheça o projeto
          <span>→</span>
        </a>

      </div>

      <div className="hero-image">

        <img
          src="/images/hero-arte-maker.jpg"
          alt="Estudantes participando do Arte Maker"
        />

        <div className="hero-note">
          <small>ESTUDANTES</small>
          <span>CRIANDO</span>
          <strong>AMANHÃS</strong>
          <strong>MAIS COLORIDOS</strong>
        </div>

      </div>

    </section>
  )
}

export default Hero