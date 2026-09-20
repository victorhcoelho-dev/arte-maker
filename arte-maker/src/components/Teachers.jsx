import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './Teachers.css'

function Teachers() {
  const [teachers, setTeachers] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    loadTeachers()
  }, [])

  async function loadTeachers() {
    try {
      setLoading(true)

      const {
        data,
        error,
      } =
        await supabase
          .from('teachers')
          .select(`
            id,
            name,
            role,
            description,
            image_url,
            display_order
          `)
          .eq(
            'published',
            true
          )
          .order(
            'display_order',
            {
              ascending: true,
            }
          )

      if (error) {
        throw error
      }

      setTeachers(
        data || []
      )
    } catch (error) {
      console.error(
        'Erro ao carregar professoras:',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="teachers"
      id="professoras"
    >

      <div className="container">

        <header className="teachers-header">

          <span>
            QUEM FAZ ACONTECER
          </span>

          <h2>
            Instrutoras
          </h2>

          <p>
            Educação, arte e experimentação
            se encontram dentro do ARTE MAKER.
          </p>

        </header>


        {loading ? (

          <div className="teachers-loading">
            Carregando professoras...
          </div>

        ) : (

          <div className="teachers-grid">

            {teachers.map(
              (teacher) => (

              <article
                className="teacher-card"
                key={teacher.id}
              >

                <div className="teacher-image">

                  {teacher.image_url ? (

                    <img
                      src={
                        teacher.image_url
                      }
                      alt={
                        teacher.name
                      }
                    />

                  ) : (

                    <div className="teacher-no-image">
                      SEM FOTO
                    </div>

                  )}

                </div>


                <div className="teacher-content">

                  {teacher.role && (
                    <span>
                      {teacher.role}
                    </span>
                  )}

                  <h3>
                    {teacher.name}
                  </h3>

                  {teacher.description && (
                    <p>
                      {teacher.description}
                    </p>
                  )}

                </div>

              </article>

            ))}

          </div>

        )}

      </div>

    </section>
  )
}

export default Teachers


