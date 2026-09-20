import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminLayout.css'

function AdminLayout() {
  const navigate = useNavigate()

  const [adminName, setAdminName] =
    useState('Administrador')

  const [adminEmail, setAdminEmail] =
    useState('')

  useEffect(() => {
    loadAdmin()
  }, [])

  async function loadAdmin() {
    try {
      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth
          .getUser()

      if (
        userError ||
        !user
      ) {
        return
      }

      setAdminEmail(
        user.email || ''
      )

      const {
        data,
        error,
      } =
        await supabase
          .from('admin_users')
          .select('display_name')
          .eq('user_id', user.id)
          .maybeSingle()

      if (error) {
        console.error(
          'Erro ao carregar administrador:',
          error
        )

        return
      }

      if (data?.display_name) {
        setAdminName(
          data.display_name
        )
      }
    } catch (error) {
      console.error(
        'Erro ao carregar administrador:',
        error
      )
    }
  }

  async function handleLogout() {
    await supabase.auth
      .signOut()

    navigate(
      '/admin/login',
      {
        replace: true,
      }
    )
  }

  function menuClass({
    isActive,
  }) {
    return isActive
      ? 'admin-menu-link active'
      : 'admin-menu-link'
  }

  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">

        <div className="admin-sidebar-top">

          <NavLink
            to="/admin"
            end
            className="admin-brand"
          >

            <img
              src="/images/logo-arte-maker.png"
              alt="Arte Maker"
            />

            <div>
              <span>
                ARTE MAKER
              </span>

              <small>
                ADMINISTRAÇÃO
              </small>
            </div>

          </NavLink>


          <nav className="admin-menu">

            <NavLink
              to="/admin"
              end
              className={menuClass}
            >
              <span className="admin-menu-icon">
                ⌂
              </span>

              Visão geral
            </NavLink>


            <NavLink
              to="/admin/obras"
              className={menuClass}
            >
              <span className="admin-menu-icon">
                ◫
              </span>

              Obras
            </NavLink>


            <NavLink
              to="/admin/eventos"
              className={menuClass}
            >
              <span className="admin-menu-icon">
                ◉
              </span>

              Eventos
            </NavLink>


            <NavLink
              to="/admin/projetos"
              className={menuClass}
            >
              <span className="admin-menu-icon">
                ◆
              </span>

              Projetos
            </NavLink>


            <NavLink
              to="/admin/professoras"
              className={menuClass}
            >
              <span className="admin-menu-icon">
                ◎
              </span>

              Professoras
            </NavLink>

          </nav>

        </div>


        <div className="admin-sidebar-bottom">

          <div className="admin-current-user">

            <span>
              CONECTADO COMO
            </span>

            <strong>
              {adminName}
            </strong>

            {adminEmail && (
              <small>
                {adminEmail}
              </small>
            )}

          </div>


          <NavLink
            to="/"
            className="admin-site-link"
          >
            Ver site

            <span>
              ↗
            </span>
          </NavLink>


          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            Sair
          </button>

        </div>

      </aside>


      <section className="admin-main">
        <Outlet />
      </section>

    </div>
  )
}

export default AdminLayout