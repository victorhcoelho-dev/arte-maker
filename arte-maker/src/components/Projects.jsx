import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Projects.css'

function Projects() {
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
            'id, slug, title, color, description, display_order'
          )
          .eq('published', true)
          .order('display_order', {
            ascending: true
          })

        if (error) {
          throw error
        }

        console.log('Projetos da Home:', data)

        setProjects(data || [])
      } catch (error) {
        console.error(
          'Erro ao carregar projetos na Home:',
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
    <section
      className="projects"
      id="projetos"
    >

      <div className="projects-header">

        <div>
          <span>NOSSO UNIVERSO</span>

          <h2>
            Nossos subprojetos
          </h2>
        </div>

        <p>
          Diferentes experiências, linguagens e formatos
          fazem parte do universo ARTE MAKER.
        </p>

      </div>


      {loading && (
        <div className="projects-home-status">
          Carregando projetos...
        </div>
      )}


      {!loading && error && (
        <div className="projects-home-status projects-home-error">
          {error}
        </div>
      )}


      {!loading && !error && (
        <div className="projects-grid">

          {projects.map((project) => (

            <article
              className={`project-card ${project.color}`}
              key={project.id}
            >

              <div className="project-number">
                +
              </div>

              <div className="project-content">

                <h3>
                  {project.title}
                </h3>

                <p>
                  {project.description}
                </p>

                <Link
                  to={`/projetos/${project.slug}`}
                >
                  Conheça o projeto
                  <span>→</span>
                </Link>

              </div>

            </article>

          ))}

        </div>
      )}


      <div className="projects-all">

        <Link to="/projetos">
          Ver todos os projetos →
        </Link>

      </div>

    </section>
  )
}

export default Projects