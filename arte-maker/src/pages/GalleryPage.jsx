import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import './GalleryPage.css'

function GalleryPage() {
  const [artworks, setArtworks] = useState([])
  const [activeCategory, setActiveCategory] =
    useState('Todos')

  const [selectedArtwork, setSelectedArtwork] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState(null)


  useEffect(() => {
    async function loadArtworks() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .eq('published', true)
          .order('display_order', {
            ascending: true
          })

        if (error) {
          throw error
        }

        setArtworks(data || [])
      } catch (error) {
        console.error(
          'Erro ao carregar obras:',
          error
        )

        setError(
          'Não foi possível carregar a galeria.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadArtworks()
  }, [])


  const categories = useMemo(() => {

    const artworkCategories =
      artworks
        .map((artwork) => artwork.category)
        .filter(Boolean)

    return [
      'Todos',
      ...new Set(artworkCategories)
    ]

  }, [artworks])


  const filteredArtworks =
    activeCategory === 'Todos'
      ? artworks
      : artworks.filter(
          (artwork) =>
            artwork.category === activeCategory
        )


  useEffect(() => {
    if (!selectedArtwork) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'


    function handleEscape(event) {
      if (event.key === 'Escape') {
        setSelectedArtwork(null)
      }
    }

    window.addEventListener(
      'keydown',
      handleEscape
    )

    return () => {
      document.body.style.overflow = ''

      window.removeEventListener(
        'keydown',
        handleEscape
      )
    }
  }, [selectedArtwork])


  function openArtwork(artwork) {
    setSelectedArtwork(artwork)
  }


  function closeArtwork() {
    setSelectedArtwork(null)
  }


  function handleArtworkKeyDown(
    event,
    artwork
  ) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault()

      openArtwork(artwork)
    }
  }


  return (
    <main className="gallery-page">

      {/* HERO */}

      <section className="gallery-page-hero">

        <span>
          PRODUÇÕES DOS ESTUDANTES
        </span>

        <h1>
          GALERIA
        </h1>

        <p>
          Conheça algumas das produções,
          experimentações e obras desenvolvidas
          dentro do ARTE MAKER.
        </p>

      </section>


      <section className="gallery-page-content">

        {/* FILTROS */}

        {!loading && !error && (
          <div className="gallery-filters">

            {categories.map((category) => (

              <button
                type="button"
                key={category}
                className={
                  activeCategory === category
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveCategory(category)
                }
              >
                {category}
              </button>

            ))}

          </div>
        )}


        {/* CARREGANDO */}

        {loading && (
          <div className="gallery-page-status">
            Carregando obras...
          </div>
        )}


        {/* ERRO */}

        {!loading && error && (
          <div className="gallery-page-status gallery-page-error">
            {error}
          </div>
        )}


        {/* GRID */}

        {!loading && !error && (
          <div className="gallery-page-grid">

            {filteredArtworks.map((artwork) => (

              <article
                className="gallery-page-card"
                key={artwork.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  openArtwork(artwork)
                }
                onKeyDown={(event) =>
                  handleArtworkKeyDown(
                    event,
                    artwork
                  )
                }
              >

                <div className="gallery-page-image">

                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                  />

                </div>


                <div className="gallery-page-info">

                  <span>
                    {artwork.category}
                  </span>

                  <h2>
                    {artwork.title}
                  </h2>

                  <p>
                    {artwork.author}
                    {artwork.year
                      ? ` · ${artwork.year}`
                      : ''}
                  </p>

                </div>

              </article>

            ))}

          </div>
        )}


        {!loading &&
          !error &&
          filteredArtworks.length === 0 && (

            <div className="gallery-page-status">
              Nenhuma obra encontrada.
            </div>

          )}

      </section>


      {/* MODAL */}

      {selectedArtwork && (

        <div
          className="artwork-modal-overlay"
          onClick={closeArtwork}
        >

          <div
            className="artwork-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="artwork-modal-close"
              onClick={closeArtwork}
              aria-label="Fechar obra"
            >
              ×
            </button>


            <div className="artwork-modal-image">

              <img
                src={selectedArtwork.image_url}
                alt={selectedArtwork.title}
              />

            </div>


            <div className="artwork-modal-content">

              <span className="artwork-modal-category">
                {selectedArtwork.category}
              </span>

              <h2>
                {selectedArtwork.title}
              </h2>


              {selectedArtwork.author && (

                <p className="artwork-modal-author">
                  {selectedArtwork.author}

                  {selectedArtwork.year
                    ? ` · ${selectedArtwork.year}`
                    : ''}
                </p>

              )}


              {selectedArtwork.description && (

                <p className="artwork-modal-description">
                  {selectedArtwork.description}
                </p>

              )}

            </div>

          </div>

        </div>

      )}

    </main>
  )
}

export default GalleryPage