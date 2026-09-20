import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header() {
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const [showHeader, setShowHeader] = useState(true)

  const lastScrollY = useRef(0)

  /* ======================================================
     FECHAR MENU AO TROCAR DE ROTA
  ====================================================== */

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])


  /* ======================================================
     HEADER INTELIGENTE
     some descendo / aparece subindo
  ====================================================== */

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY

      if (currentScrollY < 80 || menuOpen) {
        setShowHeader(true)
        lastScrollY.current = currentScrollY
        return
      }

      if (currentScrollY > lastScrollY.current) {
        setShowHeader(false)
      } else {
        setShowHeader(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    )

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      )
    }
  }, [menuOpen])


  /* ======================================================
     IR PARA O TOPO DA HOME
  ====================================================== */

  function handleHomeClick() {
    setMenuOpen(false)
    setShowHeader(true)

    /*
      Quando já estamos na Home,
      o React Router não troca de página.
      Então fazemos o scroll manualmente.
    */

    if (location.pathname === '/') {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      })
    }
  }


  function closeMenu() {
    setMenuOpen(false)
  }


  function toggleMenu() {
    setMenuOpen((current) => !current)
    setShowHeader(true)
  }


  return (
    <header
      className={`header ${
        showHeader ? '' : 'header-hidden'
      }`}
    >
      <div className="header-container">

        {/* LOGO */}

        <Link
          to="/"
          className="logo"
          onClick={handleHomeClick}
          aria-label="Ir para o início"
        >
          <img
            src="/images/logo-arte-maker.png"
            alt="Arte Maker"
          />
        </Link>


        {/* NAVEGAÇÃO */}

        <nav
          className={`nav ${
            menuOpen ? 'nav-open' : ''
          }`}
        >

          <Link
            to="/"
            onClick={handleHomeClick}
          >
            Início
          </Link>


          <Link
            to="/#projeto"
            onClick={closeMenu}
          >
            O Projeto
          </Link>


          <Link
            to="/projetos"
            onClick={closeMenu}
          >
            Projetos
          </Link>


          <Link
            to="/galeria"
            onClick={closeMenu}
          >
            Galeria
          </Link>


          <Link
            to="/eventos"
            onClick={closeMenu}
          >
            Eventos
          </Link>


          <Link
            to="/#museu"
            onClick={closeMenu}
          >
            Museu Maker
          </Link>


          <Link
            to="/#escola"
            onClick={closeMenu}
          >
            Escola
          </Link>

        </nav>


        {/* BOTÃO PRINCIPAL */}

        <Link
          to="/#projeto"
          className="header-button"
          onClick={closeMenu}
        >
          Conheça o projeto
          <span>→</span>
        </Link>


        {/* BOTÃO MOBILE */}

        <button
          type="button"
          className={`menu-button ${
            menuOpen ? 'active' : ''
          }`}
          onClick={toggleMenu}
          aria-label={
            menuOpen
              ? 'Fechar menu'
              : 'Abrir menu'
          }
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

      </div>
    </header>
  )
}

export default Header