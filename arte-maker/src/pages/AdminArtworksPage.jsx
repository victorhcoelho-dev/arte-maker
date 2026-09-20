import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../utils/errorMessages'
import './AdminArtworksPage.css'

const initialForm = {
  title: '',
  category: '',
  author: '',
  year: '',
  description: '',
  image_url: '',
  display_order: 0,
  published: true,
}

function AdminArtworksPage() {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState(null)

  const [form, setForm] = useState(initialForm)

  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadArtworks()
  }, [])

  async function loadArtworks() {
    try {
      setLoading(true)
      setPageError('')

      const { data, error } = await supabase
        .from('artworks')
        .select(`
          *,
          updated_admin:admin_users!artworks_updated_by_fkey (
            display_name
          )
        `)
        .order('display_order', {
          ascending: true,
        })

      if (error) {
        throw error
      }

      setArtworks(data || [])
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
      setPageError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  function revokePreview() {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  function resetForm() {
    revokePreview()

    setForm(initialForm)
    setEditingArtwork(null)
    setImageFile(null)
    setPreviewUrl('')
    setFormError('')
  }

  function openCreateModal() {
    resetForm()
    setModalOpen(true)
  }

  function openEditModal(artwork) {
    revokePreview()

    setEditingArtwork(artwork)

    setForm({
      title: artwork.title || '',
      category: artwork.category || '',
      author: artwork.author || '',
      year: artwork.year || '',
      description: artwork.description || '',
      image_url: artwork.image_url || '',
      display_order: artwork.display_order ?? 0,
      published: artwork.published ?? true,
    })

    setImageFile(null)
    setPreviewUrl('')
    setFormError('')
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return

    setModalOpen(false)
    resetForm()
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFormError('Selecione um arquivo de imagem válido.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError('A imagem deve ter no máximo 10 MB.')
      return
    }

    revokePreview()

    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setFormError('')
  }

  function createFileName(file) {
    const extension =
      file.name.split('.').pop()?.toLowerCase() || 'jpg'

    const uniqueId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`

    return `${uniqueId}.${extension}`
  }

  async function uploadImage(file) {
    const fileName = createFileName(file)
    const filePath = `artworks/${fileName}`

    const { error } = await supabase.storage
      .from('arte-maker-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (error) {
      throw error
    }

    const { data } = supabase.storage
      .from('arte-maker-media')
      .getPublicUrl(filePath)

    return {
      url: data.publicUrl,
      path: filePath,
    }
  }

  function getStoragePath(imageUrl) {
    if (!imageUrl) return null

    const marker =
      '/storage/v1/object/public/arte-maker-media/'

    const markerPosition = imageUrl.indexOf(marker)

    if (markerPosition === -1) {
      return null
    }

    const path = imageUrl.substring(
      markerPosition + marker.length
    )

    return decodeURIComponent(path.split('?')[0])
  }

  async function removeStorageImage(imageUrl) {
    const path = getStoragePath(imageUrl)

    if (!path) return

    const { error } = await supabase.storage
      .from('arte-maker-media')
      .remove([path])

    if (error) {
      console.error('Erro ao remover imagem:', error)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      setFormError('Informe o título da obra.')
      return
    }

    if (!editingArtwork && !imageFile && !form.image_url) {
      setFormError('Selecione uma imagem para a obra.')
      return
    }

    setSaving(true)
    setFormError('')

    let uploadedImage = null

    try {
      let imageUrl = form.image_url || null

      if (imageFile) {
        uploadedImage = await uploadImage(imageFile)
        imageUrl = uploadedImage.url
      }

      const payload = {
        title: form.title.trim(),
        category: form.category.trim() || null,
        author: form.author.trim() || null,
        year: form.year ? Number(form.year) : null,
        description: form.description.trim() || null,
        image_url: imageUrl,
        display_order: Number(form.display_order) || 0,
        published: Boolean(form.published),
      }

      if (editingArtwork) {
        const oldImageUrl = editingArtwork.image_url

        const { error } = await supabase
          .from('artworks')
          .update(payload)
          .eq('id', editingArtwork.id)

        if (error) {
          throw error
        }

        if (
          imageFile &&
          oldImageUrl &&
          oldImageUrl !== imageUrl
        ) {
          await removeStorageImage(oldImageUrl)
        }
      } else {
        const { error } = await supabase
          .from('artworks')
          .insert([payload])

        if (error) {
          throw error
        }
      }

      await loadArtworks()

      setModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar obra:', error)

      if (uploadedImage?.url) {
        await removeStorageImage(uploadedImage.url)
      }

      setFormError(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(artwork) {
    const confirmed = window.confirm(
      `Deseja realmente excluir "${artwork.title}"?\n\nEssa ação não poderá ser desfeita.`
    )

    if (!confirmed) return

    try {
      setDeletingId(artwork.id)

      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', artwork.id)

      if (error) {
        throw error
      }

      await removeStorageImage(artwork.image_url)

      setArtworks((current) =>
        current.filter((item) => item.id !== artwork.id)
      )
    } catch (error) {
      console.error('Erro ao excluir obra:', error)

      window.alert(getErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  function formatUpdateDate(date) {
    if (!date) return ''

    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getUpdateText(artwork) {
    const name = artwork.updated_admin?.display_name

    if (!artwork.updated_by || !name) {
      return 'Atualização anterior ao histórico'
    }

    return `Última atualização: ${name} · ${formatUpdateDate(
      artwork.updated_at
    )}`
  }

  const publishedCount = artworks.filter(
    (artwork) => artwork.published
  ).length

  const draftCount = artworks.filter(
    (artwork) => !artwork.published
  ).length

  return (
    <div className="admin-artworks-page">

      <header className="admin-page-header">

        <div>
          <span>GALERIA</span>

          <h1>Obras</h1>

          <p>
            Gerencie as produções exibidas na galeria do site.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={openCreateModal}
        >
          <span>+</span>
          Nova obra
        </button>

      </header>


      <div className="admin-artworks-summary">

        <div>
          <span>TOTAL</span>
          <strong>{artworks.length}</strong>
          <small>obras cadastradas</small>
        </div>

        <div>
          <span>PUBLICADAS</span>
          <strong>{publishedCount}</strong>
          <small>visíveis no site</small>
        </div>

        <div>
          <span>RASCUNHOS</span>
          <strong>{draftCount}</strong>
          <small>ocultas do público</small>
        </div>

      </div>


      {loading && (
        <div className="admin-artworks-status">
          Carregando obras...
        </div>
      )}


      {!loading && pageError && (
        <div className="admin-artworks-status error">
          {pageError}
        </div>
      )}


      {!loading &&
        !pageError &&
        artworks.length > 0 && (

        <div className="admin-artworks-list">

          {artworks.map((artwork, index) => (

            <article
              className="admin-artwork-row"
              key={artwork.id}
            >

              <div className="admin-artwork-order">
                {String(index + 1).padStart(2, '0')}
              </div>


              <div className="admin-artwork-thumb">

                {artwork.image_url ? (

                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                  />

                ) : (

                  <span>SEM FOTO</span>

                )}

              </div>


              <div className="admin-artwork-main">

                <div className="admin-artwork-labels">

                  {artwork.category && (
                    <span>
                      {artwork.category}
                    </span>
                  )}

                  <span
                    className={
                      artwork.published
                        ? 'published'
                        : 'draft'
                    }
                  >
                    {artwork.published
                      ? 'Publicada'
                      : 'Rascunho'}
                  </span>

                </div>


                <h2>
                  {artwork.title}
                </h2>


                <p>
                  {artwork.author || 'Autor não informado'}

                  {artwork.year
                    ? ` · ${artwork.year}`
                    : ''}
                </p>


                <small className="admin-last-update">
                  {getUpdateText(artwork)}
                </small>

              </div>


              <div className="admin-artwork-position">
                <span>ORDEM</span>
                <strong>
                  {artwork.display_order ?? 0}
                </strong>
              </div>


              <div className="admin-artwork-actions">

                <button
                  type="button"
                  className="edit"
                  onClick={() =>
                    openEditModal(artwork)
                  }
                >
                  Editar
                </button>


                <button
                  type="button"
                  className="delete"
                  disabled={
                    deletingId === artwork.id
                  }
                  onClick={() =>
                    handleDelete(artwork)
                  }
                >
                  {deletingId === artwork.id
                    ? 'Excluindo...'
                    : 'Excluir'}
                </button>

              </div>

            </article>

          ))}

        </div>

      )}


      {!loading &&
        !pageError &&
        artworks.length === 0 && (

        <div className="admin-artworks-empty">

          <span>GALERIA VAZIA</span>

          <h2>
            Nenhuma obra cadastrada.
          </h2>

          <p>
            Cadastre a primeira obra para começar
            a montar a galeria.
          </p>

          <button
            type="button"
            onClick={openCreateModal}
          >
            + Cadastrar obra
          </button>

        </div>

      )}


      {modalOpen && (

        <div
          className="admin-artwork-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal()
            }
          }}
        >

          <div className="admin-artwork-modal">

            <header className="admin-artwork-modal-header">

              <div>

                <span>
                  {editingArtwork
                    ? 'EDITAR OBRA'
                    : 'NOVA OBRA'}
                </span>

                <h2>
                  {editingArtwork
                    ? editingArtwork.title
                    : 'Adicionar obra'}
                </h2>

              </div>


              <button
                type="button"
                className="admin-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Fechar"
              >
                ×
              </button>

            </header>


            <form
              className="admin-artwork-form"
              onSubmit={handleSubmit}
            >

              <div className="admin-artwork-image-field">

                <div className="admin-artwork-preview">

                  {previewUrl || form.image_url ? (

                    <img
                      src={previewUrl || form.image_url}
                      alt="Prévia da obra"
                    />

                  ) : (

                    <div>
                      <strong>+</strong>
                      <span>Nenhuma imagem</span>
                    </div>

                  )}

                </div>


                <label className="admin-upload-button">

                  Escolher imagem

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                  />

                </label>


                <small>
                  JPG, PNG ou WEBP · máximo 10 MB
                </small>

              </div>


              <div className="admin-artwork-fields">

                <div className="admin-field full">

                  <label htmlFor="title">
                    Título *
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Nome da obra"
                    required
                  />

                </div>


                <div className="admin-field">

                  <label htmlFor="category">
                    Categoria
                  </label>

                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Ex.: Pintura"
                  />

                </div>


                <div className="admin-field">

                  <label htmlFor="author">
                    Autor
                  </label>

                  <input
                    id="author"
                    name="author"
                    type="text"
                    value={form.author}
                    onChange={handleChange}
                    placeholder="Nome do estudante"
                  />

                </div>


                <div className="admin-field">

                  <label htmlFor="year">
                    Ano
                  </label>

                  <input
                    id="year"
                    name="year"
                    type="number"
                    min="1900"
                    max="2100"
                    value={form.year}
                    onChange={handleChange}
                    placeholder="2026"
                  />

                </div>


                <div className="admin-field">

                  <label htmlFor="display_order">
                    Ordem
                  </label>

                  <input
                    id="display_order"
                    name="display_order"
                    type="number"
                    min="0"
                    value={form.display_order}
                    onChange={handleChange}
                  />

                </div>


                <div className="admin-field full">

                  <label htmlFor="description">
                    Descrição
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows="5"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Conte um pouco sobre a obra..."
                  />

                </div>


                <label className="admin-published-field">

                  <input
                    type="checkbox"
                    name="published"
                    checked={form.published}
                    onChange={handleChange}
                  />

                  <div>

                    <strong>
                      Publicar no site
                    </strong>

                    <span>
                      Quando desativado, a obra fica salva
                      apenas no painel.
                    </span>

                  </div>

                </label>


                {formError && (
                  <div className="admin-form-error">
                    {formError}
                  </div>
                )}

              </div>


              <footer className="admin-artwork-form-actions">

                <button
                  type="button"
                  className="secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Salvando...'
                    : editingArtwork
                      ? 'Salvar alterações'
                      : 'Cadastrar obra'}
                </button>

              </footer>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default AdminArtworksPage