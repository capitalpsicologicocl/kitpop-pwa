import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import AccessCodePanel from '../../components/interactive/AccessCodePanel'
import WorkspaceSectionEditor from '../../components/workspace/WorkspaceSectionEditor'
import { useAuth } from '../../context/AuthContext'
import { fetchAccessCodesByType } from '../../services/accessCodeService'
import {
  archiveWorkspace,
  assignParticipantGroup,
  createWorkspaceSection,
  deleteWorkspaceSection,
  fetchWorkspaceById,
  fetchWorkspaceGroups,
  fetchWorkspaceSections,
  getWorkspacePanelSummary,
  getParticipantLimitMessage,
  isWorkspaceSetupError,
  pauseWorkspace,
  publishWorkspace,
  reopenWorkspace,
  replaceWorkspaceGroups,
  setGroupEditor,
  updateWorkspace,
  updateWorkspaceSection,
} from '../../services/workspaceService'
import {
  SECTION_TYPE_OPTIONS,
  aggregateBooleanResponses,
  aggregateChoiceResponses,
  aggregateLikertResponses,
  buildDefaultSection,
  getWorkspaceStatusLabel,
  isResponseSection,
} from '../../utils/workspaceHelpers'
import { buildWorkspaceExportHtml } from '../../utils/workspaceExport'

const TABS = [
  { id: 'design', label: 'Diseño' },
  { id: 'panel', label: 'Panel en vivo' },
  { id: 'export', label: 'Exportar' },
]

export default function WorkspaceEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [tab, setTab] = useState('design')
  const [workspace, setWorkspace] = useState(null)
  const [sections, setSections] = useState([])
  const [panel, setPanel] = useState({ participants: [], groups: [], responses: [] })
  const [accessCode, setAccessCode] = useState('')
  const [form, setForm] = useState(null)
  const [groupNames, setGroupNames] = useState('')
  const [loading, setLoading] = useState(true)
  const [panelLoading, setPanelLoading] = useState(false)
  const [savingMeta, setSavingMeta] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [sectionSavingId, setSectionSavingId] = useState('')
  const [addingType, setAddingType] = useState('')
  const [setupError, setSetupError] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const responseSectionIds = useMemo(() => {
    return new Set(
      (panel.responses ?? []).map((response) => response.section_id)
    )
  }, [panel.responses])

  const loadWorkspace = useCallback(async () => {
    if (!user || !id) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [workspaceData, sectionData, groupData, codes] = await Promise.all([
        fetchWorkspaceById(user.id, id),
        fetchWorkspaceSections(user.id, id),
        fetchWorkspaceGroups(user.id, id),
        fetchAccessCodesByType(user.id, 'workspace'),
      ])

      if (!workspaceData) {
        setError('No encontramos este espacio.')
        setWorkspace(null)
        return
      }

      setWorkspace(workspaceData)
      setSections(sectionData)
      setGroupNames(groupData.map((group) => group.name).join('\n'))
      setForm({
        title: workspaceData.title ?? '',
        description: workspaceData.description ?? '',
        navigation_mode: workspaceData.settings?.navigation_mode ?? 'free',
      })
      setAccessCode(codes.find((entry) => entry.resource_id === id)?.code ?? '')
      setSetupError(false)
    } catch (loadError) {
      const missingSetup = isWorkspaceSetupError(loadError)
      setSetupError(missingSetup)
      setError(
        missingSetup
          ? 'Ejecuta supabase/workspaces_v1.sql en Supabase SQL Editor.'
          : loadError.message || 'No se pudo cargar el espacio.'
      )
    } finally {
      setLoading(false)
    }
  }, [id, user])

  const loadPanel = useCallback(async () => {
    if (!id) {
      return
    }

    setPanelLoading(true)

    try {
      const summary = await getWorkspacePanelSummary(id)
      setPanel(summary)
    } catch (panelError) {
      setError(panelError.message || 'No se pudo cargar el panel.')
    } finally {
      setPanelLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      setLoading(false)
      return
    }

    loadWorkspace()
  }, [authLoading, loadWorkspace, user])

  useEffect(() => {
    if (tab !== 'panel' && tab !== 'export') {
      return undefined
    }

    loadPanel()
    const interval = window.setInterval(loadPanel, 30000)
    return () => window.clearInterval(interval)
  }, [loadPanel, tab])

  async function handleSaveMeta(event) {
    event.preventDefault()

    if (!user || !workspace || !form) {
      return
    }

    setSavingMeta(true)
    setMessage('')
    setError('')

    try {
      const updated = await updateWorkspace(user.id, workspace.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        status: workspace.status,
        settings: { navigation_mode: form.navigation_mode },
      })
      setWorkspace(updated)
      setMessage('Datos guardados.')
    } catch (saveError) {
      setError(saveError.message || 'No se pudieron guardar los datos.')
    } finally {
      setSavingMeta(false)
    }
  }

  async function handleSaveGroups() {
    if (!user || !workspace) {
      return
    }

    const names = groupNames
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    if (names.length === 0) {
      setError('Indica al menos un grupo (uno por línea).')
      return
    }

    setError('')
    setMessage('')

    try {
      const saved = await replaceWorkspaceGroups(user.id, workspace.id, names.map((name) => ({ name })))
      setGroupNames(saved.map((group) => group.name).join('\n'))
      setMessage('Grupos actualizados.')
      await loadPanel()
    } catch (saveError) {
      setError(saveError.message || 'No se pudieron guardar los grupos.')
    }
  }

  async function handleStatusChange(nextStatus) {
    if (!user || !workspace) {
      return
    }

    setStatusUpdating(true)
    setError('')
    setMessage('')

    try {
      let updated

      if (nextStatus === 'open') {
        updated = workspace.status === 'paused'
          ? await reopenWorkspace(user.id, workspace.id)
          : await publishWorkspace(user.id, workspace.id)
      } else if (nextStatus === 'paused') {
        updated = await pauseWorkspace(user.id, workspace.id)
      } else if (nextStatus === 'archived') {
        if (!window.confirm('¿Archivar? Los participantes perderán acceso.')) {
          return
        }
        updated = await archiveWorkspace(user.id, workspace.id)
      } else {
        updated = await updateWorkspace(user.id, workspace.id, { status: nextStatus })
      }

      setWorkspace(updated)
      setMessage(`Estado: ${getWorkspaceStatusLabel(updated.status)}`)
    } catch (statusError) {
      setError(statusError.message || 'No se pudo cambiar el estado.')
    } finally {
      setStatusUpdating(false)
    }
  }

  async function handleAddSection(sectionType) {
    if (!user || !workspace) {
      return
    }

    setAddingType(sectionType)
    setError('')

    try {
      const defaults = buildDefaultSection(sectionType, sections.length)
      const created = await createWorkspaceSection(user.id, workspace.id, defaults)
      setSections((current) => [...current, created])
      setMessage('Bloque agregado.')
    } catch (createError) {
      setError(createError.message || 'No se pudo agregar el bloque.')
    } finally {
      setAddingType('')
    }
  }

  async function handleSaveSection(section) {
    if (!user) {
      return
    }

    setSectionSavingId(section.id)
    setError('')

    try {
      const updated = await updateWorkspaceSection(user.id, section.id, section)
      setSections((current) =>
        current.map((item) => (item.id === section.id ? updated : item))
      )
      setMessage('Bloque guardado.')
    } catch (saveError) {
      setError(saveError.message || 'No se pudo guardar el bloque.')
    } finally {
      setSectionSavingId('')
    }
  }

  async function handleDeleteSection(sectionId) {
    if (!user || !window.confirm('¿Eliminar este bloque?')) {
      return
    }

    try {
      await deleteWorkspaceSection(user.id, sectionId)
      setSections((current) => current.filter((section) => section.id !== sectionId))
    } catch (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar el bloque.')
    }
  }

  async function handleAssignGroup(participantId, groupId) {
    setError('')

    try {
      await assignParticipantGroup(participantId, groupId || null)
      await loadPanel()
    } catch (assignError) {
      setError(assignError.message || 'No se pudo asignar el grupo.')
    }
  }

  async function handleSetEditor(groupId, participantId) {
    setError('')

    try {
      await setGroupEditor(groupId, participantId || null)
      await loadPanel()
    } catch (editorError) {
      setError(editorError.message || 'No se pudo asignar el editor.')
    }
  }

  function handlePrintExport() {
    if (!workspace) {
      return
    }

    const html = buildWorkspaceExportHtml({
      workspace,
      sections,
      participants: panel.participants,
      groups: panel.groups,
      responses: panel.responses,
    })

    const printWindow = window.open('', '_blank', 'noopener,noreferrer')

    if (!printWindow) {
      setError('Permite ventanas emergentes para imprimir o usa Descargar Word.')
      return
    }

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  if (authLoading || loading) {
    return (
      <main id="interactive-view" className="fade-in">
        <p className="auth-loading">Cargando espacio...</p>
      </main>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  if (!workspace) {
    return (
      <main id="interactive-view" className="fade-in">
        <Link to="/interactivo/espacios" className="back-btn">← Espacios</Link>
        <p>{error || 'Espacio no encontrado.'}</p>
      </main>
    )
  }

  const participants = panel.participants ?? []

  return (
    <main id="interactive-view" className="fade-in workspace-editor-page">
      <Link to="/interactivo/espacios" className="back-btn">
        ← Espacios de trabajo
      </Link>

      <div className="page-head">
        <h1 className="cv-title">{workspace.title}</h1>
        <span className={`interactive-status status-${workspace.status}`}>
          {getWorkspaceStatusLabel(workspace.status)}
        </span>
      </div>

      <AccessCodePanel code={accessCode} resourceLabel="Espacio de trabajo" />

      <div className="workspace-status-actions">
        {workspace.status === 'draft' && (
          <button
            type="button"
            className="btn-primary"
            disabled={statusUpdating}
            onClick={() => handleStatusChange('open')}
          >
            Publicar espacio
          </button>
        )}
        {workspace.status === 'open' && (
          <button
            type="button"
            className="timer-btn timer-btn-secondary"
            disabled={statusUpdating}
            onClick={() => handleStatusChange('paused')}
          >
            Pausar
          </button>
        )}
        {workspace.status === 'paused' && (
          <button
            type="button"
            className="btn-primary"
            disabled={statusUpdating}
            onClick={() => handleStatusChange('open')}
          >
            Reabrir
          </button>
        )}
        {workspace.status !== 'archived' && (
          <button
            type="button"
            className="timer-btn timer-btn-ghost"
            disabled={statusUpdating}
            onClick={() => handleStatusChange('archived')}
          >
            Archivar
          </button>
        )}
      </div>

      <nav className="interactive-nav workspace-tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`interactive-nav-link ${tab === item.id ? 'on' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {error && <div className="auth-message error">{error}</div>}
      {setupError && (
        <div className="auth-panel interactive-note">
          <p>Ejecuta <code>supabase/workspaces_v1.sql</code> en Supabase antes de continuar.</p>
        </div>
      )}
      {message && <div className="auth-message success">{message}</div>}

      {tab === 'design' && form && (
        <>
          <form className="auth-panel interactive-form" onSubmit={handleSaveMeta}>
            <h3>Datos del espacio</h3>
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="ws-title">Título visible</label>
                <input
                  id="ws-title"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </div>
              <div className="field full">
                <label htmlFor="ws-desc">Descripción</label>
                <textarea
                  id="ws-desc"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="ws-nav">Navegación</label>
                <select
                  id="ws-nav"
                  value={form.navigation_mode}
                  onChange={(event) =>
                    setForm({ ...form, navigation_mode: event.target.value })
                  }
                >
                  <option value="free">Libre entre secciones</option>
                  <option value="sequential">Secuencial obligatorio</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={savingMeta}>
                {savingMeta ? 'Guardando...' : 'Guardar datos'}
              </button>
            </div>
          </form>

          <div className="auth-panel interactive-form workspace-groups-panel">
            <h3>Grupos</h3>
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="ws-groups">Nombres de grupos</label>
                <p className="field-hint">Un nombre por línea. Ej: Grupo 1, Equipo Norte…</p>
                <textarea
                  id="ws-groups"
                  rows={7}
                  value={groupNames}
                  onChange={(event) => setGroupNames(event.target.value)}
                  placeholder={'Grupo 1\nGrupo 2\nEquipo Norte'}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-primary" onClick={handleSaveGroups}>
                Guardar grupos
              </button>
            </div>
          </div>

          <div className="auth-panel interactive-form">
            <h3>Agregar bloques</h3>
            <div className="workspace-add-types">
              {SECTION_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="timer-btn timer-btn-secondary"
                  disabled={addingType === option.value}
                  onClick={() => handleAddSection(option.value)}
                >
                  + {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="workspace-section-list">
            {sections.map((section) => (
              <WorkspaceSectionEditor
                key={section.id}
                section={section}
                hasResponses={responseSectionIds.has(section.id)}
                saving={sectionSavingId === section.id}
                onChange={(next) =>
                  setSections((current) =>
                    current.map((item) => (item.id === section.id ? next : item))
                  )
                }
                onSave={() => handleSaveSection(section)}
                onDelete={() => handleDeleteSection(section.id)}
              />
            ))}
          </div>
        </>
      )}

      {tab === 'panel' && (
        <div className="auth-panel workspace-panel">
          <div className="workspace-panel-head">
            <h3>Panel en vivo</h3>
            <p className="interactive-item-meta">
              {getParticipantLimitMessage(participants.length)}
              {panelLoading ? ' · Actualizando...' : ' · Se actualiza cada 30 s'}
            </p>
            <button type="button" className="timer-btn timer-btn-ghost" onClick={loadPanel}>
              Actualizar ahora
            </button>
          </div>

          <div className="workspace-panel-table-wrap">
            <table className="workspace-panel-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Grupo</th>
                  <th>Editor</th>
                  <th>Avance</th>
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Aún no hay inscripciones.</td>
                  </tr>
                ) : (
                  participants.map((participant) => (
                    <tr key={participant.id}>
                      <td>{participant.display_name}</td>
                      <td>{participant.email}</td>
                      <td>
                        <select
                          value={participant.group_id ?? ''}
                          onChange={(event) =>
                            handleAssignGroup(participant.id, event.target.value)
                          }
                        >
                          <option value="">Sin grupo</option>
                          {(panel.groups ?? []).map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {participant.group_id ? (
                          <select
                            value={
                              (panel.groups ?? []).find(
                                (group) => group.id === participant.group_id
                              )?.editor_participant_id ?? ''
                            }
                            onChange={(event) =>
                              handleSetEditor(participant.group_id, event.target.value)
                            }
                          >
                            <option value="">Sin editor</option>
                            {participants
                              .filter((member) => member.group_id === participant.group_id)
                              .map((member) => (
                                <option key={member.id} value={member.id}>
                                  {member.display_name}
                                </option>
                              ))}
                          </select>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{participant.completion_pct ?? 0}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="workspace-live-responses">
            {sections.filter(isResponseSection).map((section) => {
              const sectionResponses = (panel.responses ?? []).filter(
                (response) => response.section_id === section.id
              )

              return (
                <article key={section.id} className="workspace-live-section auth-panel">
                  <h4>{section.title}</h4>
                  <p className="interactive-item-meta">
                    {section.scope === 'group' ? 'Grupal' : 'Individual'} ·{' '}
                    {section.section_type}
                  </p>

                  {(section.section_type === 'single_choice' ||
                    section.section_type === 'multi_choice') && (
                    <ul>
                      {aggregateChoiceResponses(section, sectionResponses).map((option) => (
                        <li key={option.id}>
                          {option.label}: <strong>{option.count}</strong>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.section_type === 'likert' && (
                    <p>
                      Promedio:{' '}
                      <strong>
                        {aggregateLikertResponses(section, sectionResponses).average}
                      </strong>
                    </p>
                  )}

                  {section.section_type === 'boolean' && (
                    <p>
                      Sí:{' '}
                      <strong>
                        {aggregateBooleanResponses(section, sectionResponses).yesPct}%
                      </strong>
                    </p>
                  )}

                  {(section.section_type === 'text_short' ||
                    section.section_type === 'text_long' ||
                    section.section_type === 'table') && (
                    <ul className="workspace-text-responses">
                      {sectionResponses.slice(0, 20).map((response, index) => (
                        <li key={index}>
                          <code>{JSON.stringify(response.value)}</code>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'export' && (
        <div className="auth-panel workspace-export-panel">
          <h3>Exportar resumen</h3>
          <p className="interactive-item-meta">
            Genera una vista imprimible con inscripciones y respuestas agregadas.
          </p>
          <button type="button" className="btn-primary" onClick={handlePrintExport}>
            Imprimir / PDF (navegador)
          </button>
        </div>
      )}
    </main>
  )
}
