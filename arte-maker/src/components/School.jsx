import './School.css'

function School() {
  return (
    <section className="school" id="escola">

      <div className="school-image">

        <img
          src="/images/firjan-sesi-maracana.jpg"
          alt="Firjan SESI Maracanã"
        />

        <div className="school-note">
          <span>AQUI</span>
          <strong>TALENTOS</strong>
          <strong>GANHAM ESPAÇO</strong>
        </div>

      </div>

      <div className="school-content">

        <span className="school-tag">
          ONDE TUDO ACONTECE
        </span>

        <h2>
          FIRJAN SESI
          <br />
          <span>MARACANÃ</span>
        </h2>

        <p>
          É na Firjan SESI Maracanã que o ARTE MAKER ganha forma.
          Um espaço onde criatividade, educação, arte e tecnologia
          se encontram.
        </p>

        <p>
          A escola é o ponto de partida para experiências que atravessam
          a sala de aula e chegam a exposições, eventos, projetos e
          ambientes digitais.
        </p>

        <a
          href="https://firjan.com.br/pagina-inicial.htm"
          className="school-button"
          target="_blank"
          rel="noreferrer"
        >
          Conheça a escola
          <span>→</span>
        </a>

      </div>

    </section>
  )
}

export default School