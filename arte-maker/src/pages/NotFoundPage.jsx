import { Link } from 'react-router-dom'
import './NotFoundPage.css'

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="not-found-content">
        <span className="not-found-code">
          404
        </span>

        <p className="not-found-label">
          PÁGINA NÃO ENCONTRADA
        </p>

        <h1>
          Parece que essa obra
          <br />
          ainda não existe.
        </h1>

        <p className="not-found-description">
          O endereço acessado não foi encontrado.
          Volte para o início e continue explorando
          o ARTE MAKER.
        </p>

        <Link
          to="/"
          className="not-found-button"
        >
          Voltar para o início
          <span>→</span>
        </Link>
      </div>

      <div className="not-found-art">
        <div className="not-found-shape pink" />
        <div className="not-found-shape blue" />
        <div className="not-found-shape orange" />

        <span>
          arte.
          <br />
          ideias.
          <br />
          pessoas.
        </span>
      </div>
    </main>
  )
}

export default NotFoundPage