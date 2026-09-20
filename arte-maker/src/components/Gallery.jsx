import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Gallery.css'

function Gallery() {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArtworks()
  }, [])

  async function loadArtworks() {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id,
          title,
          category,
          image_url,
          display_order
        `)
        .eq('published', true)
        .order('display_order', {
          ascending: true,
        })
        .limit(6)

      if (error) {
        throw error
      }

      setArtworks(data || [])
    } catch (error) {
      console.error(
        'Erro ao carregar galeria:',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="gallery"
      id="galeria"
    >
      <div className="container">

        <header className="gallery-header">

          <div>
            <span className="gallery-eyebrow">
              PRODUÇÕES DOS ALUNOS
            </span>

            <h2>
              Galeria de
              <br />
              trabalhos
            </h2>
          </div>

          <div className="gallery-header-right">

            <p>
              Trabalhos desenvolvidos pelos estudantes
              dentro do universo ARTE MAKER.
            </p>

            <Link
              to="/galeria"
              className="gallery-header-link"
            >
              Ver galeria completa
              <span>→</span>
            </Link>

          </div>

        </header>


        {loading ? (

          <div className="gallery-loading">
            Carregando galeria...
          </div>

        ) : (

          <div className="gallery-grid">

            {artworks.map((artwork, index) => (

              <article
                key={artwork.id}
                className={`artwork artwork-${index + 1}`}
              >

                {artwork.image_url ? (

                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                  />

                ) : (

                  <div className="artwork-no-image">
                    SEM IMAGEM
                  </div>

                )}


                <div className="artwork-overlay">

                  <div className="artwork-overlay-content">

                    {artwork.category && (

                      <span className="artwork-category">
                        {artwork.category}
                      </span>

                    )}

                    <h3>
                      {artwork.title}
                    </h3>

                    <span className="artwork-link">
                      Conheça a obra →
                    </span>

                  </div>

                </div>

              </article>

            ))}


            <div className="gallery-note">

              <span>
                ARTE FEITA
              </span>

              <strong>
                POR ESTUDANTES
              </strong>

              <strong>
                REAIS.
              </strong>

            </div>

          </div>

        )}


        <div className="gallery-mobile-link">

          <Link to="/galeria">
            Ver galeria completa
            <span>→</span>
          </Link>

        </div>

      </div>
    </section>
  )
}

export default Gallery