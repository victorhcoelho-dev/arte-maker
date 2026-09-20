import { useEffect, useState } from 'react'
import {
  Link,
  Navigate,
  useParams
} from 'react-router-dom'

import { supabase } from '../lib/supabase'

import './ProjectDetailPage.css'


function ProjectDetailPage() {

  const { slug } = useParams()

  const [project, setProject] = useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState(null)

  const [notFound, setNotFound] =
    useState(false)


  useEffect(() => {

    async function loadProject() {

      try {

        setLoading(true)

        setError(null)

        setNotFound(false)


        const {
          data,
          error
        } = await supabase
          .from('projects')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .maybeSingle()


        if (error) {
          throw error
        }


        if (!data) {

          setNotFound(true)

          return
        }


        setProject(data)

      } catch (error) {

        console.error(
          'Erro ao carregar projeto:',
          error
        )

        setError(
          'Não foi possível carregar este projeto.'
        )

      } finally {

        setLoading(false)

      }

    }


    loadProject()

  }, [slug])


  /*
    PROJETO NÃO ENCONTRADO
  */

  if (!loading && notFound) {

    return (
      <Navigate
        to="/projetos"
        replace
      />
    )

  }


  /*
    CARREGAMENTO
  */

  if (loading) {

    return (

      <main className="project-detail">

        <div className="project-detail-status">

          Carregando projeto...

        </div>

      </main>

    )

  }


  /*
    ERRO
  */

  if (error) {

    return (

      <main className="project-detail">

        <div
          className="
            project-detail-status
            project-detail-error
          "
        >

          <strong>
            Não foi possível carregar o projeto.
          </strong>

          <Link to="/projetos">
            Voltar para projetos
          </Link>

        </div>

      </main>

    )

  }


  return (

    <main
      className={`
        project-detail
        ${project.color}
      `}
    >

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="project-detail-hero">


        <div className="project-detail-title">


          <Link
            to="/projetos"
            className="project-back"
          >

            ← Todos os projetos

          </Link>


          <span>
            SUBPROJETO ARTE MAKER
          </span>


          <h1>
            {project.title}
          </h1>


          <p>
            {project.description}
          </p>


        </div>


        <div className="project-detail-image">

          <img
            src={project.image_url}
            alt={project.title}
          />

        </div>


      </section>


      {/* ==================================================
          SOBRE
      ================================================== */}

      <section className="project-detail-about">


        <div className="project-detail-about-title">

          <span>
            O PROJETO
          </span>

          <h2>
            SOBRE O
            <br />
            {project.title}
          </h2>

        </div>


        <div className="project-detail-about-text">

          <p>
            {project.about}
          </p>

        </div>


      </section>


      {/* ==================================================
          FRASE DE DESTAQUE
      ================================================== */}

      {project.highlight && (

        <section className="project-detail-highlight">

          <p>
            {project.highlight}
          </p>

        </section>

      )}


      {/* ==================================================
          GALERIA DO PROJETO
      ================================================== */}

      <section className="project-detail-gallery">


        <div className="project-detail-gallery-header">

          <span>
            REGISTROS
          </span>

          <h2>
            UM POUCO DO
            <br />
            PROJETO
          </h2>

        </div>


        <div className="project-detail-gallery-grid">


          <div className="project-gallery-placeholder">

            <span>
              FOTO 01
            </span>

          </div>


          <div className="project-gallery-placeholder">

            <span>
              FOTO 02
            </span>

          </div>


          <div className="project-gallery-placeholder">

            <span>
              FOTO 03
            </span>

          </div>


        </div>


      </section>


    </main>

  )

}


export default ProjectDetailPage