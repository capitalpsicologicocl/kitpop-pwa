import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import AccessCodePanel from '../../components/interactive/AccessCodePanel'
import RichTextEditor from '../../components/ui/RichTextEditor'
import WorkspaceAddActivities from '../../components/workspace/WorkspaceAddActivities'
import WorkspaceClosureSurveyPreview from '../../components/workspace/WorkspaceClosureSurveyPreview'
import WorkspaceParticipantResponsesModal from '../../components/workspace/WorkspaceParticipantResponsesModal'
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
  setWorkspaceModuleFlags,
  updateWorkspace,
  updateWorkspaceSection,
} from '../../services/workspaceService'
import {
  aggregateBooleanResponses,
  aggregateChoiceResponses,
  aggregateLikertResponses,
  buildDefaultSection,
  buildClosureSurveySections,
  buildSectionSavePayload,
  getConnectedParticipantCount,
  getDefaultWorkspaceSettings,
  getWorkspaceStatusLabel,
  isClosureSurveySection,
  isResponseSection,
  normalizeWorkspaceSections,
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
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab')
  const { user, loading: authLoading } = useAuth()

  const [tab, setTab] = useState(
    TABS.some((item) => item.id === initialTab) ? initialTab : 'design'
  )
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
  const [addingType, setAddingType] = useState('')
  const [lastAddedSectionId, setLastAddedSectionId] = useState('')
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [setupError, setSetupError] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const responseSectionIds = useMemo(() => {
    return new Set(
      (panel.responses ?? []).map((response) => response.section_id)
    )
  }, [panel.responses])

  const connectedCount = useMemo(
    () => getConnectedParticipantCount(panel.participants ?? [], panel.responses ?? []),
    [panel.participants, panel.responses]
  )

  const activitySections = useMemo(
    () => sections.filter((section) => !isClosureSurveySection(section)),
    [sections]
  )

  const closureSections = useMemo(
    () => sections.filter((section) => isClosureSurveySection(section)),
    [sections]
  )

  const workspaceSettings = workspace?.settings ?? panel.settings ?? {}
  const attendanceRegisteredCount = useMemo(
    () =>
      (panel.participants ?? []).filter((participant) => participant.attendance_registered_at)
        .length,
    [panel.participants]
  )

  const loadWorkspace = useCallback(async () => {
    if (!user?.id || !id) {
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
      setSections(normalizeWorkspaceSections(sectionData))
      setGroupNames(groupData.map((group) => group.name).join('\n'))
      const defaultSettings = getDefaultWorkspaceSettings(workspaceData.settings ?? {})
      setForm({
        title: workspaceData.title ?? '',
        description: workspaceData.description ?? '',
        navigation_mode: defaultSettings.navigation_mode,
        dates: defaultSettings.dates,
        moduleSettings: defaultSettings,
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
  }, [id, user?.id])

  const loadPanel = useCallback(async () => {
    if (!id) {
      return
    }

    setPanelLoading(true)

    try {
      const summary = await getWorkspacePanelSummary(id)
      setPanel(summary)
      if (summary.settings) {
        setWorkspace((current) =>
          current ? { ...current, settings: summary.settings } : current
        )
      }
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
  }, [authLoading, loadWorkspace, user?.id])

  useEffect(() => {
    if (tab !== 'panel' && tab !== 'export') {
      return undefined
    }

    loadPanel()
    const interval = window.setInterval(loadPanel, 30000)
    return () => window.clearInterval(interval)
  }, [loadPanel, tab])

  async function persistWorkspaceMeta(nextModuleSettings = null) {
    if (!user || !workspace || !form) {
      return false
    }

    const moduleSettings =
      nextModuleSettings ?? form.moduleSettings ?? getDefaultWorkspaceSettings()
    const cleanedDates = (form.dates ?? []).map((entry) => String(entry ?? '').trim()).filter(Boolean)
    const settings = {
      ...moduleSettings,
      navigation_mode: form.navigation_mode,
      dates: cleanedDates,
    }

    const updated = await updateWorkspace(user.id, workspace.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      status: workspace.status,
      settings,
    })

    await syncClosureSurveySections(
      Boolean(moduleSettings.closure_survey?.enabled),
      Number(moduleSettings.closure_survey?.likert_scale) || 5
    )

    setForm((current) =>
      current ? { ...current, moduleSettings: getDefaultWorkspaceSettings(settings) } : current
    )
    setWorkspace(updated)
    return true
  }

  async function handleSaveMeta(event) {
    event.preventDefault()

    setSavingMeta(true)
    setMessage('')
    setError('')

    try {
      await persistWorkspaceMeta()
      setMessage('Datos guardados.')
    } catch (saveError) {
      setError(saveError.message || 'No se pudieron guardar los datos.')
    } finally {
      setSavingMeta(false)
    }
  }

  async function handleSaveAll() {
    if (!user) {
      return
    }

    setSavingMeta(true)
    setMessage('')
    setError('')

    try {
      await persistWorkspaceMeta()

      for (const section of activitySections) {
        const updated = await updateWorkspaceSection(
          user.id,
          section.id,
          buildSectionSavePayload(section)
        )
        setSections((current) =>
          current.map((item) => (item.id === section.id ? updated : item))
        )
      }

      setMessage('Espacio guardado.')
    } catch (saveError) {
      setError(saveError.message || 'No se pudo guardar el espacio.')
    } finally {
      setSavingMeta(false)
    }
  }

  async function handleSaveAndFinish() {
    setSavingMeta(true)
    setMessage('')
    setError('')

    try {
      await persistWorkspaceMeta()

      for (const section of activitySections) {
        await updateWorkspaceSection(
          user.id,
          section.id,
          buildSectionSavePayload(section)
        )
      }

      navigate('/interactivo/espacios')
    } catch (saveError) {
      setError(saveError.message || 'No se pudo guardar el espacio.')
    } finally {
      setSavingMeta(false)
    }
  }

  function handleDateChange(index, value) {
    setForm((current) => {
      const nextDates = [...(current?.dates ?? [''])]
      nextDates[index] = value
      return { ...current, dates: nextDates }
    })
  }

  function handleAddDate() {
    setForm((current) => ({
      ...current,
      dates: [...(current?.dates ?? ['']), ''],
    }))
  }

  function handleRemoveDate(index) {
    setForm((current) => {
      const nextDates = [...(current?.dates ?? [''])]

      if (nextDates.length <= 1) {
        nextDates[0] = ''
        return { ...current, dates: nextDates }
      }

      nextDates.splice(index, 1)
      return { ...current, dates: nextDates }
    })
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

  async function syncClosureSurveySections(enabled, likertScale) {
    if (!user || !workspace) {
      return
    }

    const existingClosure = sections.filter((section) => isClosureSurveySection(section))

    for (const section of existingClosure) {
      await deleteWorkspaceSection(user.id, section.id)
    }

    if (!enabled) {
      setSections((current) => current.filter((section) => !isClosureSurveySection(section)))
      return
    }

    const regularCount = sections.filter((section) => !isClosureSurveySection(section)).length
    const drafts = buildClosureSurveySections(likertScale, regularCount)
    const created = []

    for (const draft of drafts) {
      created.push(await createWorkspaceSection(user.id, workspace.id, draft))
    }

    setSections((current) => [
      ...current.filter((section) => !isClosureSurveySection(section)),
      ...created,
    ])
  }

  async function handleModuleFlagChange(flags) {
    if (!workspace) {
      return
    }

    setError('')
    setMessage('')

    try {
      const nextSettings = await setWorkspaceModuleFlags(workspace.id, flags)
      setWorkspace((current) => ({ ...current, settings: nextSettings }))
      setForm((current) =>
        current
          ? {
              ...current,
              moduleSettings: getDefaultWorkspaceSettings(nextSettings),
            }
          : current
      )
      setMessage(
        flags.attendancePromptActive
          ? 'Popup de asistencia enviado a participantes conectados.'
          : flags.closureSurveyActive
            ? 'Encuesta de cierre activada para participantes.'
            : 'Módulo actualizado.'
      )
      await loadPanel()
    } catch (moduleError) {
      setError(moduleError.message || 'No se pudo actualizar el módulo.')
    }
  }

  async function handleAddActivity(option) {
    if (!user || !workspace || !form) {
      return
    }

    if (option.kind === 'module') {
      setAddingType(option.value)
      setError('')
      setMessage('')

      try {
        const currentSettings = form.moduleSettings ?? getDefaultWorkspaceSettings()

        if (option.value === 'closure_survey') {
          if (currentSettings.closure_survey?.enabled) {
            setMessage('La encuesta de satisfacción ya está en este espacio.')
            return
          }

          const nextSettings = {
            ...currentSettings,
            closure_survey: {
              ...currentSettings.closure_survey,
              enabled: true,
              likert_scale: currentSettings.closure_survey?.likert_scale ?? 5,
            },
          }

          await persistWorkspaceMeta(nextSettings)
          setMessage('Encuesta de satisfacción agregada. Actívala desde el panel en vivo.')
          return
        }

        if (option.value === 'attendance') {
          if (currentSettings.attendance?.enabled) {
            setMessage('El registro de asistencia ya está en este espacio.')
            return
          }

          const nextSettings = {
            ...currentSettings,
            attendance: {
              ...currentSettings.attendance,
              enabled: true,
            },
          }

          await persistWorkspaceMeta(nextSettings)
          setMessage('Registro de asistencia agregado. Dispara el popup desde el panel en vivo.')
        }
      } catch (moduleError) {
        setError(moduleError.message || 'No se pudo agregar el módulo.')
      } finally {
        setAddingType('')
      }

      return
    }

    setAddingType(option.value)
    setError('')

    try {
      const defaults = buildDefaultSection(
        option.value,
        activitySections.length,
        'individual',
        activitySections
      )
      const created = await createWorkspaceSection(user.id, workspace.id, defaults)
      setSections((current) => [...current, created])
      setLastAddedSectionId(created.id)
      setMessage('Actividad agregada.')
    } catch (createError) {
      setError(createError.message || 'No se pudo agregar la actividad.')
    } finally {
      setAddingType('')
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

      <div className={`workspace-tab-panel ${tab === 'design' ? '' : 'workspace-tab-hidden'}`} hidden={tab !== 'design'}>
        {form && (
        <>
          <form className="auth-panel interactive-form" onSubmit={handleSaveMeta}>
            <h3>Datos del espacio</h3>
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="ws-title">Título visible</label>
                <input
                  id="ws-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </div>
              <div className="field full">
                <label htmlFor="ws-desc">Descripción</label>
                <RichTextEditor
                  id="ws-desc"
                  value={form.description}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, description: value }))
                  }
                  placeholder="Contexto general del espacio para los participantes."
                  minHeight={120}
                />
              </div>
              <div className="field">
                <label htmlFor="ws-nav">Navegación</label>
                <select
                  id="ws-nav"
                  value={form.navigation_mode}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      navigation_mode: event.target.value,
                    }))
                  }
                >
                  <option value="free">Libre entre secciones</option>
                  <option value="sequential">Secuencial obligatorio</option>
                </select>
              </div>

              <div className="field full">
                <label>Fechas del espacio</label>
                <p className="field-hint">Opcional. Puedes registrar una o más jornadas.</p>
                <div className="workspace-date-list">
                  {(form.dates ?? ['']).map((dateValue, index) => (
                    <div key={`ws-date-${index}`} className="workspace-date-row">
                      <input
                        type="date"
                        value={dateValue}
                        onChange={(event) => handleDateChange(index, event.target.value)}
                        aria-label={`Fecha ${index + 1}`}
                      />
                      {(form.dates?.length ?? 1) > 1 ? (
                        <button
                          type="button"
                          className="timer-btn timer-btn-ghost"
                          onClick={() => handleRemoveDate(index)}
                        >
                          Quitar
                        </button>
                      ) : null}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="timer-btn timer-btn-secondary workspace-date-add"
                    onClick={handleAddDate}
                  >
                    + Fecha
                  </button>
                </div>
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

          <div className="workspace-section-list">
            {activitySections.map((section, index) => (
              <WorkspaceSectionEditor
                key={section.id}
                section={section}
                sectionIndex={index}
                sections={activitySections}
                hasResponses={responseSectionIds.has(section.id)}
                defaultExpanded={section.id === lastAddedSectionId}
                onChange={(next) =>
                  setSections((current) =>
                    current.map((item) => (item.id === section.id ? next : item))
                  )
                }
                onDelete={() => handleDeleteSection(section.id)}
              />
            ))}
          </div>

          <WorkspaceAddActivities
            addingType={addingType}
            onAdd={handleAddActivity}
            onSave={handleSaveAll}
            onFinish={handleSaveAndFinish}
            saving={savingMeta}
            moduleSettings={form.moduleSettings ?? getDefaultWorkspaceSettings()}
          />
        </>
        )}
      </div>

      <div className={`workspace-tab-panel ${tab === 'panel' ? '' : 'workspace-tab-hidden'}`} hidden={tab !== 'panel'}>
        <div className="auth-panel workspace-panel">
          <div className="workspace-panel-head">
            <h3>Panel en vivo</h3>
            <p className="interactive-item-meta">
              {(panel.participants ?? []).length} inscritos · {connectedCount} conectados ahora ·{' '}
              {getParticipantLimitMessage((panel.participants ?? []).length)}
              {panelLoading ? ' · Actualizando...' : ' · Se actualiza cada 30 s'}
            </p>
            <button type="button" className="timer-btn timer-btn-ghost" onClick={loadPanel}>
              Actualizar ahora
            </button>
          </div>

          <div className="workspace-live-modules auth-panel">
            <h4>Módulos en vivo</h4>
            <div className="workspace-live-modules-actions">
              {workspaceSettings.attendance?.enabled && (
                <>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleModuleFlagChange({ attendancePromptActive: true })}
                  >
                    Solicitar registro de asistencia
                  </button>
                  <button
                    type="button"
                    className="timer-btn timer-btn-ghost"
                    onClick={() => handleModuleFlagChange({ attendancePromptActive: false })}
                  >
                    Cerrar popup de asistencia
                  </button>
                  <p className="interactive-item-meta">
                    {attendanceRegisteredCount} / {(panel.participants ?? []).length} registraron
                    asistencia
                    {workspaceSettings.attendance?.prompt_active ? ' · Popup activo' : ''}
                  </p>
                </>
              )}

              {workspaceSettings.closure_survey?.enabled && (
                <>
                  <WorkspaceClosureSurveyPreview
                    likertScale={Number(workspaceSettings.closure_survey?.likert_scale) || 5}
                    questionCount={closureSections.length}
                  />
                  <div className="workspace-live-modules-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleModuleFlagChange({ closureSurveyActive: true })}
                    disabled={closureSections.length === 0}
                  >
                    Activar encuesta de cierre
                  </button>
                  <button
                    type="button"
                    className="timer-btn timer-btn-ghost"
                    onClick={() => handleModuleFlagChange({ closureSurveyActive: false })}
                  >
                    Ocultar encuesta de cierre
                  </button>
                  <p className="interactive-item-meta">
                    {closureSections.length} preguntas ·{' '}
                    {workspaceSettings.closure_survey?.active
                      ? 'Visible para quienes finalizaron su panel'
                      : 'Oculta hasta activar'}
                  </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="workspace-panel-table-wrap">
            <table className="workspace-panel-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Grupo</th>
                  <th>Editor</th>
                  <th>Avance</th>
                  <th>Asistencia</th>
                  <th aria-label="Respuestas" />
                </tr>
              </thead>
              <tbody>
                {(panel.participants ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={8}>Aún no hay inscripciones.</td>
                  </tr>
                ) : (
                  (panel.participants ?? []).map((participant, index) => (
                    <tr key={participant.id}>
                      <td>{index + 1}</td>
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
                            {(panel.participants ?? [])
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
                      <td>{participant.attendance_registered_at ? '✓' : '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="workspace-response-link"
                          title="Ver respuestas completas"
                          aria-label={`Ver respuestas de ${participant.display_name}`}
                          onClick={() => setSelectedParticipant(participant)}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <path
                              fill="currentColor"
                              d="M3.9 12a5 5 0 0 1 9.05-2.9l1.43 1.43A3 3 0 0 0 12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4a3 3 0 0 0 2.32-1.1l1.43 1.43A5 5 0 0 1 3.9 12Zm14.43-1.17 1.43-1.43A5 5 0 0 1 20.1 12a5 5 0 0 1-9.05 2.9l-1.43-1.43A3 3 0 0 0 12 16c2.21 0 4-1.79 4-4a3 3 0 0 0-2.32-1.17l-1.43 1.43A5 5 0 0 1 20.33 10.83ZM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
                            />
                          </svg>
                        </button>
                      </td>
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
      </div>

      {selectedParticipant && (
        <WorkspaceParticipantResponsesModal
          participant={selectedParticipant}
          sections={sections}
          responses={panel.responses ?? []}
          groups={panel.groups ?? []}
          onClose={() => setSelectedParticipant(null)}
        />
      )}

      <div className={`workspace-tab-panel ${tab === 'export' ? '' : 'workspace-tab-hidden'}`} hidden={tab !== 'export'}>
        <div className="auth-panel workspace-export-panel">
          <h3>Exportar resumen</h3>
          <p className="interactive-item-meta">
            Genera una vista imprimible con inscripciones y respuestas agregadas.
          </p>
          <button type="button" className="btn-primary" onClick={handlePrintExport}>
            Imprimir / PDF (navegador)
          </button>
        </div>
      </div>
    </main>
  )
}
