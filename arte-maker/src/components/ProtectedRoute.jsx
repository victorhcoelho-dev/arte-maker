import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true

    async function checkAccess() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!active) return

        if (sessionError || !session) {
          setStatus('logged-out')
          return
        }

        const {
          data: isAdmin,
          error: adminError,
        } = await supabase.rpc('is_admin')

        if (!active) return

        if (adminError || !isAdmin) {
          await supabase.auth.signOut()

          if (active) {
            setStatus('denied')
          }

          return
        }

        setStatus('authorized')
      } catch (error) {
        console.error(
          'Erro ao verificar acesso administrativo:',
          error
        )

        if (active) {
          setStatus('denied')
        }
      }
    }

    checkAccess()

    return () => {
      active = false
    }
  }, [])

  if (status === 'checking') {
    return (
      <div
        style={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4f3ef',
          fontSize: '13px',
          fontWeight: '700',
        }}
      >
        Verificando acesso...
      </div>
    )
  }

  if (status === 'logged-out') {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    )
  }

  if (status === 'denied') {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute