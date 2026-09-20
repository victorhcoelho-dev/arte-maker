import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../utils/errorMessages'
import './AdminDashboard.css'

function AdminDashboard() {
  const [stats, setStats] = useState({
    artworks: {
      total: 0,
      published: 0,
      drafts: 0,
    },

    events: {
      total: 0,
      published: 0,
      drafts: 0,
    },

    projects: {
      total: 0,
      published: 0,
      drafts: 0,
    },
  })

  const [activities, setActivities] = useState([])

  const [loading, setLoading] = useState(true)

  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  async function getCount(table, published = null) {
    let query = supabase
      .from(table)
      .select('*', {
        count: 'exact',
        head: true,
      })

    if (published !== null) {
      query = query.eq(
        'published',
        published
      )
    }

    const {
      count,
      error,
    } = await query

    if (error) {
      throw error
    }

    return count || 0
  }

  async function loadActivities() {
    const {
      data,
      error,
    } = await supabase
      .from('audit_log')
      .select(`
        id,
        action,
        entity_type,
        entity_id,
        entity_title,
        created_at,
        admin_users (
          display_name
        )
      `)
      .order(
        'created_at',
        {
          ascending: false,
        }
      )
      .limit(8)

    if (error) {
      throw error
    }

    return data || []
  }

  async function loadDashboard() {
    try {
      setLoading(true)

      setErrorMessage('')

      const [
        artworksTotal,
        artworksPublished,

        eventsTotal,
        eventsPublished,

        projectsTotal,
        projectsPublished,

        activityData,
      ] = await Promise.all([

        getCount('artworks'),

        getCount(
          'artworks',
          true
        ),

        getCount('events'),

        getCount(
          'events',
          true
        ),

        getCount('projects'),

        getCount(
          'projects',
          true
        ),

        loadActivities(),

      ])

      setStats({
        artworks: {
          total:
            artworksTotal,

          published:
            artworksPublished,

          drafts:
            artworksTotal -
            artworksPublished,
        },

        events: {
          total:
            eventsTotal,

          published:
            eventsPublished,

          drafts:
            eventsTotal -
            eventsPublished,
        },

        projects: {
          total:
            projectsTotal,

          published:
            projectsPublished,

          drafts:
            projectsTotal -
            projectsPublished,
        },
      })

      setActivities(
        activityData
      )
    } catch (error) {
      console.error(
        'Erro ao carregar painel:',
        error
      )

      setErrorMessage(
        getErrorMessage(error)
      )
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date) {
    if (!date) {
      return ''
    }

    return new Date(date)
      .toLocaleString(
        'pt-BR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      )
  }

  function getActionText(action) {
    const actions = {
      insert: 'cadastrou',
      update: 'atualizou',
      delete: 'excluiu',
    }

    return (
      actions[action] ||
      'alterou'
    )
  }

  function getEntityName(entityType) {
    const entities = {
      artworks: 'a obra',
      events: 'o evento',
      projects: 'o projeto',
    }

    return (
      entities[entityType] ||
      'o conteúdo'
    )
  }

  function getEntityLabel(entityType) {
    const labels = {
      artworks: 'Obra',
      events: 'Evento',
      projects: 'Projeto',
    }

    return (
      labels[entityType] ||
      'Conteúdo'
    )
  }

  function getTypeClass(entityType) {
    if (
      entityType ===
      'artworks'
    ) {
      return 'pink'
    }

    if (
      entityType ===
      'events'
    ) {
      return 'orange'
    }

    return 'blue'
  }

  function getAdminPath(entityType) {
    const paths = {
      artworks:
        '/admin/obras',

      events:
        '/admin/eventos',

      projects:
        '/admin/projetos',
    }

    return (
      paths[entityType] ||
      '/admin'
    )
  }

  return (
    <div className="admin-dashboard-page">

      <header className="admin-dashboard-header">

        <div>

          <span>
            ADMINISTRAÇÃO
          </span>

          <h1>
            Visão geral
          </h1>

          <p>
            Acompanhe e gerencie o conteúdo
            publicado no site ARTE MAKER.
          </p>

        </div>

      </header>


      {errorMessage && (

        <div className="admin-dashboard-error">

          <div>

            <strong>
              Não foi possível carregar o painel.
            </strong>

            <span>
              {errorMessage}
            </span>

          </div>


          <button
            type="button"
            onClick={loadDashboard}
          >
            Tentar novamente
          </button>

        </div>

      )}


      {/* CARDS */}

      <section className="admin-dashboard-grid">

        <Link
          to="/admin/obras"
          className="admin-dashboard-card pink"
        >

          <div className="admin-dashboard-card-top">

            <span>
              GALERIA
            </span>

            <strong>
              →
            </strong>

          </div>


          <div className="admin-dashboard-card-content">

            <h2>
              Obras
            </h2>

            <strong className="admin-dashboard-number">

              {loading
                ? '—'
                : stats.artworks.total}

            </strong>

            <p>
              produções cadastradas
            </p>

          </div>


          <div className="admin-dashboard-card-footer">

            <span>
              {loading
                ? '—'
                : stats.artworks.published}
              {' '}
              publicadas
            </span>

            <span>
              {loading
                ? '—'
                : stats.artworks.drafts}
              {' '}
              rascunhos
            </span>

          </div>

        </Link>


        <Link
          to="/admin/eventos"
          className="admin-dashboard-card orange"
        >

          <div className="admin-dashboard-card-top">

            <span>
              TRAJETÓRIA
            </span>

            <strong>
              →
            </strong>

          </div>


          <div className="admin-dashboard-card-content">

            <h2>
              Eventos
            </h2>

            <strong className="admin-dashboard-number">

              {loading
                ? '—'
                : stats.events.total}

            </strong>

            <p>
              eventos cadastrados
            </p>

          </div>


          <div className="admin-dashboard-card-footer">

            <span>
              {loading
                ? '—'
                : stats.events.published}
              {' '}
              publicados
            </span>

            <span>
              {loading
                ? '—'
                : stats.events.drafts}
              {' '}
              rascunhos
            </span>

          </div>

        </Link>


        <Link
          to="/admin/projetos"
          className="admin-dashboard-card blue"
        >

          <div className="admin-dashboard-card-top">

            <span>
              UNIVERSO
            </span>

            <strong>
              →
            </strong>

          </div>


          <div className="admin-dashboard-card-content">

            <h2>
              Projetos
            </h2>

            <strong className="admin-dashboard-number">

              {loading
                ? '—'
                : stats.projects.total}

            </strong>

            <p>
              projetos cadastrados
            </p>

          </div>


          <div className="admin-dashboard-card-footer">

            <span>
              {loading
                ? '—'
                : stats.projects.published}
              {' '}
              publicados
            </span>

            <span>
              {loading
                ? '—'
                : stats.projects.drafts}
              {' '}
              rascunhos
            </span>

          </div>

        </Link>

      </section>


      {/* PARTE INFERIOR */}

      <section className="admin-dashboard-bottom">

        <div className="admin-dashboard-recent">

          <div className="admin-dashboard-section-heading">

            <div>

              <span>
                HISTÓRICO
              </span>

              <h2>
                Atividade recente
              </h2>

            </div>

          </div>


          {loading ? (

            <div className="admin-dashboard-recent-status">
              Carregando atividades...
            </div>

          ) : activities.length === 0 ? (

            <div className="admin-dashboard-recent-status">
              Nenhuma alteração registrada ainda.
            </div>

          ) : (

            <div className="admin-dashboard-recent-list">

              {activities.map(
                (activity) => {

                  const adminName =
                    activity.admin_users
                      ?.display_name ||
                    'Administrador'

                  return (

                    <Link
                      key={activity.id}
                      to={getAdminPath(
                        activity.entity_type
                      )}
                      className="admin-dashboard-recent-item"
                    >

                      <span
                        className={`admin-dashboard-type ${getTypeClass(
                          activity.entity_type
                        )}`}
                      >
                        {getEntityLabel(
                          activity.entity_type
                        )}
                      </span>


                      <div className="admin-dashboard-recent-info">

                        <strong>

                          {adminName}{' '}

                          {getActionText(
                            activity.action
                          )}{' '}

                          {getEntityName(
                            activity.entity_type
                          )}

                          {activity.entity_title
                            ? ` "${activity.entity_title}"`
                            : ''}

                        </strong>


                        <span>
                          {formatDate(
                            activity.created_at
                          )}
                        </span>

                      </div>


                      <span className="admin-dashboard-recent-arrow">
                        →
                      </span>

                    </Link>

                  )

                }
              )}

            </div>

          )}

        </div>


        {/* ACESSO RÁPIDO */}

        <aside className="admin-dashboard-actions">

          <div className="admin-dashboard-section-heading">

            <div>

              <span>
                ACESSO RÁPIDO
              </span>

              <h2>
                Gerenciar
              </h2>

            </div>

          </div>


          <div className="admin-dashboard-action-links">

            <Link to="/admin/obras">

              <div className="pink">
                +
              </div>

              <span>

                <strong>
                  Gerenciar obras
                </strong>

                <small>
                  Galeria e produções
                </small>

              </span>

              <b>
                →
              </b>

            </Link>


            <Link to="/admin/eventos">

              <div className="orange">
                +
              </div>

              <span>

                <strong>
                  Gerenciar eventos
                </strong>

                <small>
                  Exposições e trajetória
                </small>

              </span>

              <b>
                →
              </b>

            </Link>


            <Link to="/admin/projetos">

              <div className="blue">
                +
              </div>

              <span>

                <strong>
                  Gerenciar projetos
                </strong>

                <small>
                  Subprojetos do ARTE MAKER
                </small>

              </span>

              <b>
                →
              </b>

            </Link>

          </div>

        </aside>

      </section>


      

    </div>
  )
}

export default AdminDashboard