import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {

    if (hash) {

      const sectionId = hash.replace('#', '')

      const timer = setTimeout(() => {

        const element =
          document.getElementById(sectionId)

        if (element) {

          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })

        }

      }, 100)

      return () => clearTimeout(timer)
    }


    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })

  }, [pathname, hash])

  return null
}

export default ScrollToTop