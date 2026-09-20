import './About.css'

function About() {
  return (
    <section className="about" id="projeto">

      <div className="about-intro">

        <div className="about-title">
          <span>O QUE É O</span>
          <h2>ARTE MAKER?</h2>
        </div>

        <div className="about-text">
          <p>
            O ARTE MAKER é um itinerário formativo da Firjan SESI Maracanã
            que incentiva os estudantes a explorar a criatividade por meio
            da arte.
          </p>

          <p>
            Aqui, os alunos desenvolvem esculturas, desenhos, instalações,
            projetos digitais e outras formas de expressão, participando
            também de exposições, eventos e experiências como o Museu Maker.
          </p>

          <a href="#projetos" className="about-button">
            Saiba mais →
          </a>
        </div>

      </div>

      <div className="about-features">

        <div className="feature-card">
          <div className="feature-icon pink">✦</div>
          <h3>Criatividade em ação</h3>
          <p>
            Ideias ganham forma através da experimentação e da criação.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon blue">●</div>
          <h3>Estudantes protagonistas</h3>
          <p>
            Os alunos participam ativamente de cada etapa do processo.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon orange">★</div>
          <h3>Arte que conecta</h3>
          <p>
            O projeto aproxima estudantes, escola, comunidade e cultura.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon pink">♥</div>
          <h3>Novos futuros</h3>
          <p>
            Arte, tecnologia e educação trabalhando juntas.
          </p>
        </div>

      </div>

    </section>
  )
}

export default About