import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../utils/errorMessages'
import './AdminTeachersPage.css'

const initialForm = {
  name: '',
  role: '',
  description: '',
  image_url: '',
  display_order: 0,
  published: true,
}

function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)

  const [form, setForm] = useState(initialForm)

  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadTeachers()
  }, [])

  async function loadTeachers() {
    try {
      setLoading(true)
      setPageError('')

      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          updated_admin:admin_users!teachers_updated_by_fkey (
            display_name
          )
        `)
        .order('display_order', {
          ascending: true,
        })

      if (error) {
        throw error
      }

      setTeachers(data || [])
    } catch (error) {
      console.error(
        'Erro ao carregar professoras:',
        error
      )

      setPageError(
        getErrorMessage(error)
      )
    } finally {
      setLoading(false)
    }
  }

  function revokePreview() {
    if (
      previewUrl &&
      previewUrl.startsWith('blob:')
    ) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  function resetForm() {
    revokePreview()

    setForm(initialForm)
    setEditingTeacher(null)
    setImageFile(null)
    setPreviewUrl('')
    setFormError('')
  }

  function openCreateModal() {
    resetForm()
    setModalOpen(true)
  }

  function openEditModal(teacher) {
    revokePreview()

    setEditingTeacher(teacher)

    setForm({
      name: teacher.name || '',
      role: teacher.role || '',
      description: teacher.description || '',
      image_url: teacher.image_url || '',
      display_order: teacher.display_order ?? 0,
      published: teacher.published ?? true,
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
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setForm((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }

  function handleImageChange(event) {
    const file =
      event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFormError(
        'Selecione um arquivo de imagem válido.'
      )

      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError(
        'A imagem deve ter no máximo 10 MB.'
      )

      return
    }

    revokePreview()

    setImageFile(file)
    setPreviewUrl(
      URL.createObjectURL(file)
    )

    setFormError('')
  }

  function createFileName(file) {
    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase() || 'jpg'

    const uniqueId =
      typeof crypto !== 'undefined' &&
      crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`

    return `${uniqueId}.${extension}`
  }

  async function uploadImage(file) {
    const fileName =
      createFileName(file)

    const filePath =
      `teachers/${fileName}`

    const { error } =
      await supabase.storage
        .from('arte-maker-media')
        .upload(
          filePath,
          file,
          {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          }
        )

    if (error) {
      throw error
    }

    const { data } =
      supabase.storage
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

    const markerPosition =
      imageUrl.indexOf(marker)

    if (markerPosition === -1) {
      return null
    }

    const path =
      imageUrl.substring(
        markerPosition + marker.length
      )

    return decodeURIComponent(
      path.split('?')[0]
    )
  }

  async function removeStorageImage(
    imageUrl
  ) {
    const path =
      getStoragePath(imageUrl)

    if (!path) return

    const { error } =
      await supabase.storage
        .from('arte-maker-media')
        .remove([path])

    if (error) {
      console.error(
        'Erro ao remover imagem:',
        error
      )
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      setFormError(
        'Informe o nome da professora.'
      )

      return
    }

    setSaving(true)
    setFormError('')

    let uploadedImage = null

    try {
      let imageUrl =
        form.image_url || null

      if (imageFile) {
        uploadedImage =
          await uploadImage(imageFile)

        imageUrl =
          uploadedImage.url
      }

      const payload = {
        name:
          form.name.trim(),

        role:
          form.role.trim() || null,

        description:
          form.description.trim() || null,

        image_url:
          imageUrl,

        display_order:
          Number(
            form.display_order
          ) || 0,

        published:
          Boolean(
            form.published
          ),
      }

      if (editingTeacher) {
        const oldImageUrl =
          editingTeacher.image_url

        const { error } =
          await supabase
            .from('teachers')
            .update(payload)
            .eq(
              'id',
              editingTeacher.id
            )

        if (error) {
          throw error
        }

        if (
          imageFile &&
          oldImageUrl &&
          oldImageUrl !== imageUrl
        ) {
          await removeStorageImage(
            oldImageUrl
          )
        }
      } else {
        const { error } =
          await supabase
            .from('teachers')
            .insert([payload])

        if (error) {
          throw error
        }
      }

      await loadTeachers()

      setModalOpen(false)
      resetForm()
    } catch (error) {
      console.error(
        'Erro ao salvar professora:',
        error
      )

      if (uploadedImage?.url) {
        await removeStorageImage(
          uploadedImage.url
        )
      }

      setFormError(
        getErrorMessage(error)
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(teacher) {
    const confirmed =
      window.confirm(
        `Deseja realmente excluir "${teacher.name}"?\n\nEssa ação não poderá ser desfeita.`
      )

    if (!confirmed) return

    try {
      setDeletingId(
        teacher.id
      )

      const { error } =
        await supabase
          .from('teachers')
          .delete()
          .eq(
            'id',
            teacher.id
          )

      if (error) {
        throw error
      }

      await removeStorageImage(
        teacher.image_url
      )

      setTeachers((current) =>
        current.filter(
          (item) =>
            item.id !== teacher.id
        )
      )
    } catch (error) {
      console.error(
        'Erro ao excluir professora:',
        error
      )

      window.alert(
        getErrorMessage(error)
      )
    } finally {
      setDeletingId(null)
    }
  }

  function formatUpdateDate(date) {
    if (!date) return ''

    return new Date(date)
      .toLocaleString(
        'pt-BR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      )
  }

  function getUpdateText(teacher) {
    const name =
      teacher.updated_admin
        ?.display_name

    if (
      !teacher.updated_by ||
      !name
    ) {
      return 'Atualização anterior ao histórico'
    }

    return `Última atualização: ${name} · ${formatUpdateDate(
      teacher.updated_at
    )}`
  }

  const publishedCount =
    teachers.filter(
      (teacher) =>
        teacher.published
    ).length

  const draftCount =
    teachers.filter(
      (teacher) =>
        !teacher.published
    ).length

  return (
    <div className="admin-teachers-page">

      <header className="admin-teachers-header">

        <div>

          <span>
            EQUIPE
          </span>

          <h1>
            Professoras
          </h1>

          <p>
            Gerencie as professoras apresentadas
            no site.
          </p>

        </div>

        <button
          type="button"
          className="admin-teachers-primary"
          onClick={openCreateModal}
        >
          <span>+</span>
          Nova professora
        </button>

      </header>


      <div className="admin-teachers-summary">

        <div>
          <span>TOTAL</span>
          <strong>
            {teachers.length}
          </strong>
          <small>
            professoras cadastradas
          </small>
        </div>

        <div>
          <span>PUBLICADAS</span>
          <strong>
            {publishedCount}
          </strong>
          <small>
            visíveis no site
          </small>
        </div>

        <div>
          <span>RASCUNHOS</span>
          <strong>
            {draftCount}
          </strong>
          <small>
            ocultas do público
          </small>
        </div>

      </div>


      {loading && (
        <div className="admin-teachers-status">
          Carregando professoras...
        </div>
      )}


      {!loading && pageError && (
        <div className="admin-teachers-status error">
          {pageError}
        </div>
      )}


      {!loading &&
        !pageError &&
        teachers.length > 0 && (

        <div className="admin-teachers-list">

          {teachers.map(
            (teacher, index) => (

            <article
              className="admin-teacher-row"
              key={teacher.id}
            >

              <div className="admin-teacher-order">
                {String(
                  index + 1
                ).padStart(2, '0')}
              </div>


              <div className="admin-teacher-thumb">

                {teacher.image_url ? (

                  <img
                    src={
                      teacher.image_url
                    }
                    alt={
                      teacher.name
                    }
                  />

                ) : (

                  <span>
                    SEM FOTO
                  </span>

                )}

              </div>


              <div className="admin-teacher-main">

                <div className="admin-teacher-labels">

                  {teacher.role && (
                    <span>
                      {teacher.role}
                    </span>
                  )}


                  <span
                    className={
                      teacher.published
                        ? 'published'
                        : 'draft'
                    }
                  >
                    {teacher.published
                      ? 'Publicada'
                      : 'Rascunho'}
                  </span>

                </div>


                <h2>
                  {teacher.name}
                </h2>


                {teacher.description && (
                  <p>
                    {teacher.description}
                  </p>
                )}


                <small className="admin-last-update">
                  {getUpdateText(
                    teacher
                  )}
                </small>

              </div>


              <div className="admin-teacher-position">

                <span>
                  ORDEM
                </span>

                <strong>
                  {teacher.display_order ??
                    0}
                </strong>

              </div>


              <div className="admin-teacher-actions">

                <button
                  type="button"
                  className="edit"
                  onClick={() =>
                    openEditModal(
                      teacher
                    )
                  }
                >
                  Editar
                </button>


                <button
                  type="button"
                  className="delete"
                  disabled={
                    deletingId ===
                    teacher.id
                  }
                  onClick={() =>
                    handleDelete(
                      teacher
                    )
                  }
                >
                  {deletingId ===
                  teacher.id
                    ? 'Excluindo...'
                    : 'Excluir'}
                </button>

              </div>

            </article>

          ))}

        </div>

      )}


      {modalOpen && (

        <div
          className="admin-teacher-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal()
            }
          }}
        >

          <div className="admin-teacher-modal">

            <header className="admin-teacher-modal-header">

              <div>

                <span>
                  {editingTeacher
                    ? 'EDITAR PROFESSORA'
                    : 'NOVA PROFESSORA'}
                </span>

                <h2>
                  {editingTeacher
                    ? editingTeacher.name
                    : 'Adicionar professora'}
                </h2>

              </div>


              <button
                type="button"
                className="admin-teacher-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Fechar"
              >
                ×
              </button>

            </header>


            <form
              className="admin-teacher-form"
              onSubmit={handleSubmit}
            >

              <div className="admin-teacher-image-field">

                <div className="admin-teacher-preview">

                  {previewUrl ||
                  form.image_url ? (

                    <img
                      src={
                        previewUrl ||
                        form.image_url
                      }
                      alt="Prévia da professora"
                    />

                  ) : (

                    <div>
                      <strong>+</strong>
                      <span>
                        Nenhuma foto
                      </span>
                    </div>

                  )}

                </div>


                <label className="admin-teacher-upload">

                  Escolher foto

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={
                      handleImageChange
                    }
                  />

                </label>

                <small>
                  JPG, PNG ou WEBP · máximo 10 MB
                </small>

              </div>


              <div className="admin-teacher-fields">

                <div className="admin-teacher-field full">

                  <label htmlFor="teacher-name">
                    Nome *
                  </label>

                  <input
                    id="teacher-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={
                      handleChange
                    }
                    placeholder="Nome da professora"
                    required
                  />

                </div>


                <div className="admin-teacher-field full">

                  <label htmlFor="teacher-role">
                    Cargo / função
                  </label>

                  <input
                    id="teacher-role"
                    name="role"
                    type="text"
                    value={form.role}
                    onChange={
                      handleChange
                    }
                    placeholder="Ex.: Professora de Artes"
                  />

                </div>


                <div className="admin-teacher-field full">

                  <label htmlFor="teacher-description">
                    Descrição
                  </label>

                  <textarea
                    id="teacher-description"
                    name="description"
                    rows="6"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Apresentação da professora..."
                  />

                </div>


                <div className="admin-teacher-field">

                  <label htmlFor="teacher-order">
                    Ordem
                  </label>

                  <input
                    id="teacher-order"
                    name="display_order"
                    type="number"
                    min="0"
                    value={
                      form.display_order
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                <label className="admin-teacher-published">

                  <input
                    type="checkbox"
                    name="published"
                    checked={
                      form.published
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <div>
                    <strong>
                      Publicar no site
                    </strong>

                    <span>
                      Quando desativado, a professora
                      permanece salva apenas no painel.
                    </span>
                  </div>

                </label>


                {formError && (
                  <div className="admin-teacher-form-error">
                    {formError}
                  </div>
                )}

              </div>


              <footer className="admin-teacher-form-actions">

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
                    : editingTeacher
                      ? 'Salvar alterações'
                      : 'Cadastrar professora'}
                </button>

              </footer>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default AdminTeachersPage