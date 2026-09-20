import { useEffect, useRef, useState } from 'react'
import './Reveal.css'

function Reveal({
  children,
  direction = 'up',
  delay = 0
}) {
  const elementRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current

    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)

          // depois da primeira animação,
          // para de observar o elemento
          observer.unobserve(element)
        }
      },
      {
        threshold: 0.12
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={elementRef}
      className={`reveal reveal-${direction} ${
        visible ? 'reveal-visible' : ''
      }`}
      style={{
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

export default Reveal