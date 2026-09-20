import './Museum.css'

function Museum() {
  return (
    <section className="museum" id="museu">

      <div className="museum-content">

        <span className="museum-tag">
          EXPERIÊNCIA DIGITAL
        </span>

        <h2>
          ENTRE NO
          <br />
          <span>MUSEU MAKER</span>
        </h2>

        <p>
          Uma experiência digital para explorar as obras do ARTE MAKER
          de outro jeito. Conheça produções, ambientes e criações dos
          estudantes em uma experiência interativa.
        </p>

        <a
          href="https://arte-maker.itch.io/museu-maker?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAcGRvZgJleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAafUQRK31O-nZ85bmwoyuoTRzNHJHwIeMoAAjoKfLdzMhLQoNB9aoz8n4F15Xw_aem_NkrNA3PQlitO-bKKDSedew"
          className="museum-button"
          target="_blank"
          rel="noreferrer"
        >
          Acessar o Museu Maker
          <span>→</span>
        </a>

      </div>

      <div className="museum-visual">

        <div className="museum-image">
          <img
            src="/images/museu-maker.jpg"
            alt="Museu Maker"
          />
        </div>

        <div className="museum-message">
          <span>ARTE TAMBÉM</span>
          <strong>PODE SER</strong>
          <strong>UMA EXPERIÊNCIA.</strong>
        </div>

      </div>

    </section>
  )
}

export default Museum