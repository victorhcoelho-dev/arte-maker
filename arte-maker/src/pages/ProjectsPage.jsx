import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './ProjectsPage.css'

function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('projects')
          .select(
            `
              id,
              slug,
              title,
              color,
              description,
              image_url,
              display_order
            `
          )
          .eq('published', true)
          .order('display_order', {
            ascending: true
          })

        if (error) {
          throw error
        }

        setProjects(data || [])
      } catch (error) {
        console.error(
          'Erro ao carregar projetos:',
          error
        )

        setError(
          'Não foi possível carregar os projetos.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  return (
    <main className="projects-page">

      {/* HERO */}

      <section className="projects-page-hero">

        <span>
          UNIVERSO ARTE MAKER
        </span>

        <h1>
          DIFERENTES
          <br />

          <strong>
            PROJETOS.
          </strong>
        </h1>

        <p>
          O ARTE MAKER se desdobra em diferentes
          experiências, formatos e iniciativas.
          Cada projeto possui uma identidade, mas
          todos compartilham a mesma essência:
          criar, experimentar e conectar.
        </p>

      </section>


      {/* CONTEÚDO */}

      <section className="projects-page-content">

        <div className="projects-page-intro">

          <span>
            EXPLORE
          </span>

          <h2>
            CONHEÇA OS
            <br />
            SUBPROJETOS
          </h2>

        </div>


        {/* CARREGAMENTO */}

        {loading && (
          <div className="projects-status">
            Carregando projetos...
          </div>
        )}


        {/* ERRO */}

        {!loading && error && (
          <div className="projects-status projects-error">
            {error}
          </div>
        )}


        {/* LISTA */}

        {!loading && !error && (
          <div className="projects-page-grid">

            {projects.map((project, index) => (

              <article
                className={`projects-page-card ${project.color}`}
                key={project.id}
              >

                {/* IMAGEM */}

                <div className="projects-page-image">

                  <img
                    src={project.image_url}
                    alt={project.title}
                  />

                </div>


                {/* CONTEÚDO */}

                <div className="projects-page-info">

                  <span className="projects-page-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>


                  <h2>
                    {project.title}
                  </h2>


                  <p>
                    {project.description}
                  </p>


                  <Link
                    to={`/projetos/${project.slug}`}
                    className="projects-page-link"
                  >
                    Conheça o projeto

                    <span>
                      →
                    </span>
                  </Link>

                </div>

              </article>

            ))}

          </div>
        )}


        {/* CASO NÃO TENHA PROJETO */}

        {!loading &&
          !error &&
          projects.length === 0 && (

            <div className="projects-status">
              Nenhum projeto publicado no momento.
            </div>

          )}

      </section>

    </main>
  )
}

export default ProjectsPage