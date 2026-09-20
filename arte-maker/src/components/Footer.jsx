import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">

      <div className="footer-container">

        {/* ==================================================
            CONTEÚDO PRINCIPAL
        ================================================== */}

        <div className="footer-top">

          {/* MARCA */}

          <div className="footer-brand">

            <Link
              to="/"
              className="footer-logo"
            >
              <img
                src="/images/logo-arte-maker.png"
                alt="Arte Maker"
              />
            </Link>


            <p className="footer-description">
              Um espaço de criação, experimentação e expressão
              artística desenvolvido na Firjan SESI Maracanã.
            </p>


            {/* INSTAGRAM ARTE MAKER */}

            <a
              href="https://www.instagram.com/maracartemaker?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noreferrer"
              className="footer-instagram"
              aria-label="Instagram do Arte Maker"
            >

              <span className="footer-instagram-icon">
                ◎
              </span>

              <div className="footer-instagram-content">

                <small>
                  SIGA O ARTE MAKER
                </small>

                <strong>
                  @maracartemaker
                </strong>

              </div>

              <span className="footer-instagram-arrow">
                ↗
              </span>

            </a>

          </div>


          {/* ==================================================
              NAVEGAÇÃO + FRASE
          ================================================== */}

          <div className="footer-navigation">

            {/* NAVEGAÇÃO */}

            <div className="footer-column">

              <span className="footer-column-title">
                NAVEGAÇÃO
              </span>

              <Link to="/">
                Início
              </Link>

              <Link to="/#projeto">
                O Projeto
              </Link>

              <Link to="/projetos">
                Projetos
              </Link>

              <Link to="/galeria">
                Galeria
              </Link>

            </div>


            {/* DESCUBRA */}

            <div className="footer-column">

              <span className="footer-column-title">
                DESCUBRA
              </span>

              <Link to="/eventos">
                Eventos
              </Link>

              <Link to="/#museu">
                Museu Maker
              </Link>

              <Link to="/#escola">
                Escola
              </Link>

            </div>


            {/* FRASE */}

            <div className="footer-words">

              <span>ARTE.</span>

              <span>IDEIAS.</span>

              <span>PESSOAS.</span>

            </div>

          </div>

        </div>


        {/* ==================================================
            PARTE INFERIOR
        ================================================== */}

        <div className="footer-bottom">

          <p className="footer-copyright">
            © {currentYear} ARTE MAKER · Firjan SESI Maracanã
          </p>


          <p className="footer-credit">

            Desenvolvido por{' '}

            <a
              href="https://www.instagram.com/vhcoelho.dev?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noreferrer"
              className="footer-developer"
            >

              <strong>
                Victor Hugo Coelho
              </strong>

              <span>
                @VHCOELHO.DEV
              </span>

            </a>

          </p>

        </div>

      </div>

    </footer>
  )
}

export default Footer