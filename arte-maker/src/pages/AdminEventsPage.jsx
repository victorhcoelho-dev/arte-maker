import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../utils/errorMessages'
import './AdminEventsPage.css'

const initialForm = {
  title: '',
  type: '',
  event_date: '',
  year: '',
  location: '',
  description: '',
  image_url: '',
  display_order: 0,
  published: true,
}

function AdminEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)

  const [form, setForm] = useState(initialForm)

  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    try {
      setLoading(true)
      setPageError('')

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          updated_admin:admin_users!events_updated_by_fkey (
            display_name
          )
        `)
        .order('display_order', {
          ascending: true,
        })

      if (error) {
        throw error
      }

      setEvents(data || [])
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
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
    setEditingEvent(null)
    setImageFile(null)
    setPreviewUrl('')
    setFormError('')
  }

  function openCreateModal() {
    resetForm()
    setModalOpen(true)
  }

  function openEditModal(eventItem) {
    revokePreview()

    setEditingEvent(eventItem)

    setForm({
      title: eventItem.title || '',
      type: eventItem.type || '',
      event_date: eventItem.event_date || '',
      year: eventItem.year || '',
      location: eventItem.location || '',
      description: eventItem.description || '',
      image_url: eventItem.image_url || '',
      display_order: eventItem.display_order ?? 0,
      published: eventItem.published ?? true,
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

  function handleDateChange(event) {
    const value = event.target.value

    setForm((current) => ({
      ...current,
      event_date: value,
      year: value
        ? new Date(`${value}T12:00:00`).getFullYear()
        : current.year,
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
    const filePath = `events/${fileName}`

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
      setFormError('Informe o nome do evento.')
      return
    }

    if (!editingEvent && !imageFile && !form.image_url) {
      setFormError('Selecione uma imagem para o evento.')
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

      const yearValue =
        form.year ||
        (form.event_date
          ? new Date(`${form.event_date}T12:00:00`).getFullYear()
          : null)

      const payload = {
        title: form.title.trim(),
        type: form.type.trim() || null,
        event_date: form.event_date || null,
        year: yearValue ? Number(yearValue) : null,
        location: form.location.trim() || null,
        description: form.description.trim() || null,
        image_url: imageUrl,
        display_order: Number(form.display_order) || 0,
        published: Boolean(form.published),
      }

      if (editingEvent) {
        const oldImageUrl = editingEvent.image_url

        const { error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', editingEvent.id)

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
          .from('events')
          .insert([payload])

        if (error) {
          throw error
        }
      }

      await loadEvents()

      setModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar evento:', error)

      if (uploadedImage?.url) {
        await removeStorageImage(uploadedImage.url)
      }

      setFormError(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(eventItem) {
    const confirmed = window.confirm(
      `Deseja realmente excluir "${eventItem.title}"?\n\nEssa ação não poderá ser desfeita.`
    )

    if (!confirmed) return

    try {
      setDeletingId(eventItem.id)

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventItem.id)

      if (error) {
        throw error
      }

      await removeStorageImage(eventItem.image_url)

      setEvents((current) =>
        current.filter((item) => item.id !== eventItem.id)
      )
    } catch (error) {
      console.error('Erro ao excluir evento:', error)

      window.alert(getErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  function formatDate(date) {
    if (!date) {
      return 'Data não informada'
    }

    return new Date(`${date}T12:00:00`).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    )
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

  function getUpdateText(eventItem) {
    const name = eventItem.updated_admin?.display_name

    if (!eventItem.updated_by || !name) {
      return 'Atualização anterior ao histórico'
    }

    return `Última atualização: ${name} · ${formatUpdateDate(
      eventItem.updated_at
    )}`
  }

  const publishedCount = events.filter(
    (eventItem) => eventItem.published
  ).length

  const draftCount = events.filter(
    (eventItem) => !eventItem.published
  ).length

  return (
    <div className="admin-events-page">

      <header className="admin-events-header">

        <div>
          <span>TRAJETÓRIA</span>

          <h1>Eventos</h1>

          <p>
            Gerencie exposições, premiações, campeonatos e
            outros registros do ARTE MAKER.
          </p>
        </div>

        <button
          type="button"
          className="admin-events-primary"
          onClick={openCreateModal}
        >
          <span>+</span>
          Novo evento
        </button>

      </header>


      <div className="admin-events-summary">

        <div>
          <span>TOTAL</span>
          <strong>{events.length}</strong>
          <small>eventos cadastrados</small>
        </div>

        <div>
          <span>PUBLICADOS</span>
          <strong>{publishedCount}</strong>
          <small>visíveis no site</small>
        </div>

        <div>
          <span>RASCUNHOS</span>
          <strong>{draftCount}</strong>
          <small>ocultos do público</small>
        </div>

      </div>


      {loading && (
        <div className="admin-events-status">
          Carregando eventos...
        </div>
      )}


      {!loading && pageError && (
        <div className="admin-events-status error">
          {pageError}
        </div>
      )}


      {!loading &&
        !pageError &&
        events.length > 0 && (

        <div className="admin-events-list">

          {events.map((eventItem, index) => (

            <article
              className="admin-event-row"
              key={eventItem.id}
            >

              <div className="admin-event-order">
                {String(index + 1).padStart(2, '0')}
              </div>


              <div className="admin-event-thumb">

                {eventItem.image_url ? (

                  <img
                    src={eventItem.image_url}
                    alt={eventItem.title}
                  />

                ) : (

                  <span>SEM FOTO</span>

                )}

              </div>


              <div className="admin-event-main">

                <div className="admin-event-labels">

                  {eventItem.type && (
                    <span>
                      {eventItem.type}
                    </span>
                  )}

                  <span
                    className={
                      eventItem.published
                        ? 'published'
                        : 'draft'
                    }
                  >
                    {eventItem.published
                      ? 'Publicado'
                      : 'Rascunho'}
                  </span>

                </div>


                <h2>
                  {eventItem.title}
                </h2>


                <p>
                  {formatDate(eventItem.event_date)}

                  {eventItem.location
                    ? ` · ${eventItem.location}`
                    : ''}
                </p>


                <small className="admin-last-update">
                  {getUpdateText(eventItem)}
                </small>

              </div>


              <div className="admin-event-position">
                <span>ORDEM</span>
                <strong>
                  {eventItem.display_order ?? 0}
                </strong>
              </div>


              <div className="admin-event-actions">

                <button
                  type="button"
                  className="edit"
                  onClick={() =>
                    openEditModal(eventItem)
                  }
                >
                  Editar
                </button>


                <button
                  type="button"
                  className="delete"
                  disabled={
                    deletingId === eventItem.id
                  }
                  onClick={() =>
                    handleDelete(eventItem)
                  }
                >
                  {deletingId === eventItem.id
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
        events.length === 0 && (

        <div className="admin-events-empty">

          <span>TRAJETÓRIA VAZIA</span>

          <h2>
            Nenhum evento cadastrado.
          </h2>

          <p>
            Cadastre o primeiro evento para começar a construir
            a trajetória do projeto.
          </p>

          <button
            type="button"
            onClick={openCreateModal}
          >
            + Cadastrar evento
          </button>

        </div>

      )}


      {modalOpen && (

        <div
          className="admin-event-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal()
            }
          }}
        >

          <div className="admin-event-modal">

            <header className="admin-event-modal-header">

              <div>

                <span>
                  {editingEvent
                    ? 'EDITAR EVENTO'
                    : 'NOVO EVENTO'}
                </span>

                <h2>
                  {editingEvent
                    ? editingEvent.title
                    : 'Adicionar evento'}
                </h2>

              </div>


              <button
                type="button"
                className="admin-event-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Fechar"
              >
                ×
              </button>

            </header>


            <form
              className="admin-event-form"
              onSubmit={handleSubmit}
            >

              <div className="admin-event-image-field">

                <div className="admin-event-preview">

                  {previewUrl || form.image_url ? (

                    <img
                      src={previewUrl || form.image_url}
                      alt="Prévia do evento"
                    />

                  ) : (

                    <div>
                      <strong>+</strong>
                      <span>Nenhuma imagem</span>
                    </div>

                  )}

                </div>


                <label className="admin-event-upload">

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


              <div className="admin-event-fields">

                <div className="admin-event-field full">

                  <label htmlFor="event-title">
                    Nome do evento *
                  </label>

                  <input
                    id="event-title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ex.: Exposição Arte Maker"
                    required
                  />

                </div>


                <div className="admin-event-field">

                  <label htmlFor="event-type">
                    Tipo
                  </label>

                  <input
                    id="event-type"
                    name="type"
                    type="text"
                    value={form.type}
                    onChange={handleChange}
                    placeholder="Ex.: Exposição"
                  />

                </div>


                <div className="admin-event-field">

                  <label htmlFor="event-location">
                    Local
                  </label>

                  <input
                    id="event-location"
                    name="location"
                    type="text"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Ex.: Firjan SESI Maracanã"
                  />

                </div>


                <div className="admin-event-field">

                  <label htmlFor="event-date">
                    Data
                  </label>

                  <input
                    id="event-date"
                    name="event_date"
                    type="date"
                    value={form.event_date}
                    onChange={handleDateChange}
                  />

                </div>


                <div className="admin-event-field">

                  <label htmlFor="event-year">
                    Ano
                  </label>

                  <input
                    id="event-year"
                    name="year"
                    type="number"
                    min="1900"
                    max="2100"
                    value={form.year}
                    onChange={handleChange}
                    placeholder="2026"
                  />

                </div>


                <div className="admin-event-field">

                  <label htmlFor="event-order">
                    Ordem
                  </label>

                  <input
                    id="event-order"
                    name="display_order"
                    type="number"
                    min="0"
                    value={form.display_order}
                    onChange={handleChange}
                  />

                </div>


                <div className="admin-event-field full">

                  <label htmlFor="event-description">
                    Descrição
                  </label>

                  <textarea
                    id="event-description"
                    name="description"
                    rows="5"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Conte um pouco sobre o evento..."
                  />

                </div>


                <label className="admin-event-published">

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
                      Quando desativado, o evento fica salvo
                      apenas no painel.
                    </span>

                  </div>

                </label>


                {formError && (
                  <div className="admin-event-form-error">
                    {formError}
                  </div>
                )}

              </div>


              <footer className="admin-event-form-actions">

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
                    : editingEvent
                      ? 'Salvar alterações'
                      : 'Cadastrar evento'}
                </button>

              </footer>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default AdminEventsPage 