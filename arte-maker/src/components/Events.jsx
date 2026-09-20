import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Events.css'

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('events')
          .select(
            `
              id,
              title,
              type,
              event_date,
              year,
              location,
              description,
              display_order
            `
          )
          .eq('published', true)
          .order('display_order', {
            ascending: true
          })
          .limit(3)

        if (error) {
          throw error
        }

        setEvents(data || [])
      } catch (error) {
        console.error(
          'Erro ao carregar eventos:',
          error
        )

        setError(
          'Não foi possível carregar os eventos.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  function formatDate(date, year) {
    if (!date) {
      return year || ''
    }

    return new Date(
      `${date}T12:00:00`
    )
      .toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      })
      .replace('.', '')
      .toUpperCase()
  }

  return (
    <section
      className="events"
      id="eventos"
    >

      <div className="events-header">

        <div>

          <span>
            TRAJETÓRIA
          </span>

          <h2>
            Eventos e
            <br />
            premiações
          </h2>

        </div>

        <p>
          Exposições, campeonatos, encontros e conquistas
          que fazem parte da história do ARTE MAKER.
        </p>

      </div>


      {loading && (
        <div className="events-home-status">
          Carregando eventos...
        </div>
      )}


      {!loading && error && (
        <div className="events-home-status events-home-error">
          {error}
        </div>
      )}


      {!loading && !error && (
        <div className="events-layout">

          <div className="events-list">

            {events.map((event) => (

              <article
                className="event-card"
                key={event.id}
              >

                <div className="event-date">
                  {formatDate(
                    event.event_date,
                    event.year
                  )}
                </div>


                <div className="event-info">

                  <span className="event-type">
                    {event.type}
                  </span>

                  <h3>
                    {event.title}
                  </h3>

                  <span className="event-location">
                    {event.location}
                  </span>

                  <p>
                    {event.description}
                  </p>

                </div>


                <Link
                  to="/eventos"
                  className="event-link"
                >
                  →
                </Link>

              </article>

            ))}

          </div>


          <aside className="events-feature">

            <span className="events-feature-label">
              ARTE QUE VAI ALÉM DA ESCOLA
            </span>

            <h3>
              Criar é só
              <br />
              o começo.
            </h3>

            <p>
              O ARTE MAKER também cria oportunidades para os
              estudantes apresentarem seus trabalhos, ocuparem
              novos espaços e compartilharem suas ideias.
            </p>

            <Link
              to="/eventos"
              className="events-feature-link"
            >
              Ver trajetória completa →
            </Link>

            <div className="events-feature-mark">
              +
            </div>

          </aside>

        </div>
      )}

    </section>
  )
}

export default Events