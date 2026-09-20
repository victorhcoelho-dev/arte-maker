import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../utils/errorMessages'
import './AdminLoginPage.css'

function AdminLoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const [authorized, setAuthorized] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    checkExistingSession()
  }, [])

  async function checkExistingSession() {
    try {
      setCheckingSession(true)

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (!session) {
        setAuthorized(false)
        return
      }

      const {
        data: isAdmin,
        error: adminError,
      } = await supabase.rpc('is_admin')

      if (adminError) {
        throw adminError
      }

      if (!isAdmin) {
        await supabase.auth.signOut()

        setAuthorized(false)

        setErrorMessage(
          'Esta conta não possui permissão administrativa.'
        )

        return
      }

      setAuthorized(true)
    } catch (error) {
      console.error(
        'Erro ao verificar acesso administrativo:',
        error
      )

      await supabase.auth.signOut()

      setAuthorized(false)

      setErrorMessage(
        'Não foi possível verificar sua permissão de acesso.'
      )
    } finally {
      setCheckingSession(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim()) {
      setErrorMessage('Informe seu e-mail.')
      return
    }

    if (!password) {
      setErrorMessage('Informe sua senha.')
      return
    }

    try {
      setLoading(true)
      setErrorMessage('')

      const {
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (loginError) {
        throw loginError
      }

      /*
        O login estar correto não significa
        que a conta pode acessar o painel.

        Agora verificamos se o usuário está
        cadastrado como administrador.
      */

      const {
        data: isAdmin,
        error: adminError,
      } = await supabase.rpc('is_admin')

      if (adminError) {
        throw adminError
      }

      if (!isAdmin) {
        await supabase.auth.signOut()

        setErrorMessage(
          'Esta conta não possui permissão administrativa.'
        )

        return
      }

      navigate('/admin', {
        replace: true,
      })
    } catch (error) {
      console.error(
        'Erro ao entrar no painel:',
        error
      )

      setErrorMessage(
        getErrorMessage(error)
      )
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-loading">
          Verificando acesso...
        </div>
      </main>
    )
  }

  if (authorized) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    )
  }

  return (
    <main className="admin-login-page">

      <section className="admin-login-panel">

        {/* LADO DA MARCA */}

        <div className="admin-login-brand">

          <img
            src="/images/logo-arte-maker-amarela.png"
            alt="Arte Maker"
          />

          <span>
            PAINEL ADMINISTRATIVO
          </span>

          <h1>
            Gerencie o
            <br />
            ARTE MAKER.
          </h1>

          <p>
            Obras, eventos e projetos
            em um único lugar.
          </p>

        </div>


        {/* FORMULÁRIO */}

        <div className="admin-login-form-container">

          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
          >

            <div className="admin-login-heading">

              <span>
                ACESSO RESTRITO
              </span>

              <h2>
                Entrar
              </h2>

              <p>
                Use uma conta administrativa
                autorizada.
              </p>

            </div>


            <label>

              <span>
                E-mail
              </span>

              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setErrorMessage('')
                }}
                placeholder="seu@email.com"
                autoComplete="email"
                disabled={loading}
                required
              />

            </label>


            <label>

              <span>
                Senha
              </span>

              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setErrorMessage('')
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                required
              />

            </label>


            {errorMessage && (

              <div className="admin-login-error">
                {errorMessage}
              </div>

            )}


            <button
              type="submit"
              disabled={loading}
            >

              {loading
                ? 'Verificando acesso...'
                : 'Entrar no painel'}

            </button>

          </form>

        </div>

      </section>

    </main>
  )
}

export default AdminLoginPage