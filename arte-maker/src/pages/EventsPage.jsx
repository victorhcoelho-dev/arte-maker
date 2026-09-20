import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import './EventsPage.css'

function EventsPage() {
  const [events, setEvents] = useState([])
  const [activeType, setActiveType] =
    useState('Todos')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState(null)


  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('published', true)
          .order('display_order', {
            ascending: true
          })

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


  const types = useMemo(() => {
    const eventTypes =
      events
        .map((event) => event.type)
        .filter(Boolean)

    return [
      'Todos',
      ...new Set(eventTypes)
    ]
  }, [events])


  const filteredEvents =
    activeType === 'Todos'
      ? events
      : events.filter(
          (event) =>
            event.type === activeType
        )


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
    <main className="events-page">

      <section className="events-page-hero">

        <span>
          TRAJETÓRIA ARTE MAKER
        </span>

        <h1>
          EVENTOS &
          <br />
          CONQUISTAS
        </h1>

        <p>
          Exposições, encontros, campeonatos,
          premiações e experiências que fazem
          parte da história do ARTE MAKER.
        </p>

      </section>


      <section className="events-page-content">

        {!loading && !error && (
          <div className="events-page-filters">

            {types.map((type) => (

              <button
                type="button"
                key={type}
                className={
                  activeType === type
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveType(type)
                }
              >
                {type}
              </button>

            ))}

          </div>
        )}


        {loading && (
          <div className="events-page-status">
            Carregando eventos...
          </div>
        )}


        {!loading && error && (
          <div className="events-page-status events-page-error">
            {error}
          </div>
        )}


        {!loading && !error && (
          <div className="events-page-grid">

            {filteredEvents.map((event) => (

              <article
                className="events-page-card"
                key={event.id}
              >

                <div className="events-page-image">

                  <img
                    src={event.image_url}
                    alt={event.title}
                  />

                  <span className="events-page-date">
                    {formatDate(
                      event.event_date,
                      event.year
                    )}
                  </span>

                </div>


                <div className="events-page-info">

                  <span className="events-page-type">
                    {event.type}
                  </span>

                  <h2>
                    {event.title}
                  </h2>

                  <span className="events-page-location">
                    {event.location}
                  </span>

                  <p>
                    {event.description}
                  </p>

                  <div className="events-page-year">
                    {event.year}
                  </div>

                </div>

              </article>

            ))}

          </div>
        )}


        {!loading &&
          !error &&
          filteredEvents.length === 0 && (

            <div className="events-page-status">
              Nenhum evento encontrado.
            </div>

          )}

      </section>

    </main>
  )
}

export default EventsPage