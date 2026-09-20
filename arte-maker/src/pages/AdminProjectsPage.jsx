import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../utils/errorMessages'
import './AdminProjectsPage.css'

const initialForm = {
  title: '',
  slug: '',
  color: 'pink',
  description: '',
  about: '',
  highlight: '',
  image_url: '',
  display_order: 0,
  published: true,
}

function AdminProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  const [form, setForm] = useState(initialForm)

  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setLoading(true)
      setPageError('')

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          updated_admin:admin_users!projects_updated_by_fkey (
            display_name
          )
        `)
        .order('display_order', {
          ascending: true,
        })

      if (error) {
        throw error
      }

      setProjects(data || [])
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
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
    setEditingProject(null)
    setImageFile(null)
    setPreviewUrl('')
    setFormError('')
  }

  function openCreateModal() {
    resetForm()
    setModalOpen(true)
  }

  function openEditModal(project) {
    revokePreview()

    setEditingProject(project)

    setForm({
      title: project.title || '',
      slug: project.slug || '',
      color: project.color || 'pink',
      description: project.description || '',
      about: project.about || '',
      highlight: project.highlight || '',
      image_url: project.image_url || '',
      display_order: project.display_order ?? 0,
      published: project.published ?? true,
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

  function createSlug(text) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setForm((current) => {
      const updatedForm = {
        ...current,
        [name]: type === 'checkbox' ? checked : value,
      }

      if (
        name === 'title' &&
        !editingProject &&
        (!current.slug ||
          current.slug === createSlug(current.title))
      ) {
        updatedForm.slug = createSlug(value)
      }

      return updatedForm
    })
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
    const filePath = `projects/${fileName}`

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
      setFormError('Informe o nome do projeto.')
      return
    }

    if (!form.slug.trim()) {
      setFormError('Informe o endereço do projeto.')
      return
    }

    const cleanSlug = createSlug(form.slug)

    if (!cleanSlug) {
      setFormError('O endereço do projeto é inválido.')
      return
    }

    if (!editingProject && !imageFile && !form.image_url) {
      setFormError('Selecione uma imagem para o projeto.')
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
        slug: cleanSlug,
        color: form.color,
        description: form.description.trim() || null,
        about: form.about.trim() || null,
        highlight: form.highlight.trim() || null,
        image_url: imageUrl,
        display_order: Number(form.display_order) || 0,
        published: Boolean(form.published),
      }

      if (editingProject) {
        const oldImageUrl = editingProject.image_url

        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', editingProject.id)

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
          .from('projects')
          .insert([payload])

        if (error) {
          throw error
        }
      }

      await loadProjects()

      setModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar projeto:', error)

      if (uploadedImage?.url) {
        await removeStorageImage(uploadedImage.url)
      }

      setFormError(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(project) {
    const confirmed = window.confirm(
      `Deseja realmente excluir "${project.title}"?\n\nEssa ação não poderá ser desfeita.`
    )

    if (!confirmed) return

    try {
      setDeletingId(project.id)

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)

      if (error) {
        throw error
      }

      await removeStorageImage(project.image_url)

      setProjects((current) =>
        current.filter((item) => item.id !== project.id)
      )
    } catch (error) {
      console.error('Erro ao excluir projeto:', error)

      window.alert(getErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  function getColorName(color) {
    const names = {
      pink: 'Rosa',
      blue: 'Azul',
      orange: 'Laranja',
    }

    return names[color] || 'Rosa'
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

  function getUpdateText(project) {
    const name = project.updated_admin?.display_name

    if (!project.updated_by || !name) {
      return 'Atualização anterior ao histórico'
    }

    return `Última atualização: ${name} · ${formatUpdateDate(
      project.updated_at
    )}`
  }

  const publishedCount = projects.filter(
    (project) => project.published
  ).length

  const draftCount = projects.filter(
    (project) => !project.published
  ).length

  return (
    <div className="admin-projects-page">

      <header className="admin-projects-header">

        <div>
          <span>UNIVERSO ARTE MAKER</span>

          <h1>Projetos</h1>

          <p>
            Gerencie os subprojetos, textos e imagens
            apresentados no site.
          </p>
        </div>

        <button
          type="button"
          className="admin-projects-primary"
          onClick={openCreateModal}
        >
          <span>+</span>
          Novo projeto
        </button>

      </header>


      <div className="admin-projects-summary">

        <div>
          <span>TOTAL</span>
          <strong>{projects.length}</strong>
          <small>projetos cadastrados</small>
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
        <div className="admin-projects-status">
          Carregando projetos...
        </div>
      )}


      {!loading && pageError && (
        <div className="admin-projects-status error">
          {pageError}
        </div>
      )}


      {!loading &&
        !pageError &&
        projects.length > 0 && (

        <div className="admin-projects-list">

          {projects.map((project, index) => (

            <article
              className="admin-project-row"
              key={project.id}
            >

              <div className="admin-project-order">
                {String(index + 1).padStart(2, '0')}
              </div>


              <div className="admin-project-thumb">

                {project.image_url ? (

                  <img
                    src={project.image_url}
                    alt={project.title}
                  />

                ) : (

                  <span>SEM FOTO</span>

                )}

              </div>


              <div className="admin-project-main">

                <div className="admin-project-labels">

                  <span
                    className={`project-color ${project.color}`}
                  >
                    {getColorName(project.color)}
                  </span>


                  <span
                    className={
                      project.published
                        ? 'published'
                        : 'draft'
                    }
                  >
                    {project.published
                      ? 'Publicado'
                      : 'Rascunho'}
                  </span>

                </div>


                <h2>
                  {project.title}
                </h2>


                <p>
                  /projetos/{project.slug}
                </p>


                <small className="admin-last-update">
                  {getUpdateText(project)}
                </small>

              </div>


              <div className="admin-project-position">
                <span>ORDEM</span>
                <strong>
                  {project.display_order ?? 0}
                </strong>
              </div>


              <div className="admin-project-actions">

                <button
                  type="button"
                  className="edit"
                  onClick={() =>
                    openEditModal(project)
                  }
                >
                  Editar
                </button>


                <button
                  type="button"
                  className="delete"
                  disabled={
                    deletingId === project.id
                  }
                  onClick={() =>
                    handleDelete(project)
                  }
                >
                  {deletingId === project.id
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
        projects.length === 0 && (

        <div className="admin-projects-empty">

          <span>NENHUM PROJETO</span>

          <h2>
            Nenhum projeto cadastrado.
          </h2>

          <p>
            Cadastre o primeiro subprojeto do ARTE MAKER.
          </p>

          <button
            type="button"
            onClick={openCreateModal}
          >
            + Cadastrar projeto
          </button>

        </div>

      )}


      {modalOpen && (

        <div
          className="admin-project-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal()
            }
          }}
        >

          <div className="admin-project-modal">

            <header className="admin-project-modal-header">

              <div>

                <span>
                  {editingProject
                    ? 'EDITAR PROJETO'
                    : 'NOVO PROJETO'}
                </span>

                <h2>
                  {editingProject
                    ? editingProject.title
                    : 'Adicionar projeto'}
                </h2>

              </div>


              <button
                type="button"
                className="admin-project-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Fechar"
              >
                ×
              </button>

            </header>


            <form
              className="admin-project-form"
              onSubmit={handleSubmit}
            >

              <div className="admin-project-image-field">

                <div className="admin-project-preview">

                  {previewUrl || form.image_url ? (

                    <img
                      src={previewUrl || form.image_url}
                      alt="Prévia do projeto"
                    />

                  ) : (

                    <div>
                      <strong>+</strong>
                      <span>Nenhuma imagem</span>
                    </div>

                  )}

                </div>


                <label className="admin-project-upload">

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


              <div className="admin-project-fields">

                <div className="admin-project-field full">

                  <label htmlFor="project-title">
                    Nome do projeto *
                  </label>

                  <input
                    id="project-title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ex.: ExpoMaker"
                    required
                  />

                </div>


                <div className="admin-project-field full">

                  <label htmlFor="project-slug">
                    Endereço da página *
                  </label>

                  <div className="admin-project-slug-field">

                    <span>
                      /projetos/
                    </span>

                    <input
                      id="project-slug"
                      name="slug"
                      type="text"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="expomaker"
                      required
                    />

                  </div>

                  <small>
                    Use apenas letras, números e hífens.
                  </small>

                </div>


                <div className="admin-project-field">

                  <label htmlFor="project-color">
                    Cor principal
                  </label>

                  <select
                    id="project-color"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                  >
                    <option value="pink">
                      Rosa
                    </option>

                    <option value="blue">
                      Azul
                    </option>

                    <option value="orange">
                      Laranja
                    </option>
                  </select>

                </div>


                <div className="admin-project-field">

                  <label htmlFor="project-order">
                    Ordem
                  </label>

                  <input
                    id="project-order"
                    name="display_order"
                    type="number"
                    min="0"
                    value={form.display_order}
                    onChange={handleChange}
                  />

                </div>


                <div className="admin-project-field full">

                  <label htmlFor="project-description">
                    Descrição resumida
                  </label>

                  <textarea
                    id="project-description"
                    name="description"
                    rows="3"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Texto usado nos cards e no início da página..."
                  />

                </div>


                <div className="admin-project-field full">

                  <label htmlFor="project-about">
                    Sobre o projeto
                  </label>

                  <textarea
                    id="project-about"
                    name="about"
                    rows="5"
                    value={form.about}
                    onChange={handleChange}
                    placeholder="Texto completo explicando o projeto..."
                  />

                </div>


                <div className="admin-project-field full">

                  <label htmlFor="project-highlight">
                    Frase de destaque
                  </label>

                  <input
                    id="project-highlight"
                    name="highlight"
                    type="text"
                    value={form.highlight}
                    onChange={handleChange}
                    placeholder="Ex.: CRIAR. EXPOR. COMPARTILHAR."
                  />

                </div>


                <label className="admin-project-published">

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
                      Quando desativado, o projeto permanece
                      salvo no painel e deixa de aparecer no site.
                    </span>

                  </div>

                </label>


                {formError && (
                  <div className="admin-project-form-error">
                    {formError}
                  </div>
                )}

              </div>


              <footer className="admin-project-form-actions">

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
                    : editingProject
                      ? 'Salvar alterações'
                      : 'Cadastrar projeto'}
                </button>

              </footer>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default AdminProjectsPage