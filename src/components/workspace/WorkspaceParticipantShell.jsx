import { useCallback, useEffect, useMemo, useState } from 'react'

import WorkspaceAttendanceModal from './WorkspaceAttendanceModal'
import WorkspaceParticipantAuth from './WorkspaceParticipantAuth'
import WorkspaceRichContent from './WorkspaceRichContent'
import WorkspaceSectionInput from './WorkspaceSectionInput'
import {
  getWorkspaceForParticipant,
  joinWorkspace,
  submitWorkspaceAttendance,
  submitWorkspacePanelFinish,
  touchWorkspacePresence,
  upsertWorkspaceResponse,
} from '../../services/workspaceService'
import {
  allClosureSectionsAnswered,
  isClosureSurveySection,
  isResponseSection,
  partitionParticipantSections,
  resolveSectionModuleName,
  shouldShowModuleHeader,
} from '../../utils/workspaceHelpers'

export default function WorkspaceParticipantShell({ code }) {
  const [workspace, setWorkspace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSectionId, setActiveSectionId] = useState('')
  const [draftValues, setDraftValues] = useState({})
  const [savingSectionId, setSavingSectionId] = useState('')
  const [finishingPanel, setFinishingPanel] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [attendanceSubmitting, setAttendanceSubmitting] = useState(false)
  const [attendanceError, setAttendanceError] = useState('')

  const loadWorkspace = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true)
    }
    setError('')

    try {
      const data = await getWorkspaceForParticipant(code)

      if (data?.error === 'auth_required') {
        setWorkspace({ needsAuth: true, title: data.title })
        return
      }

      if (data?.error === 'not_found') {
        setError('Código no encontrado o inactivo.')
        setWorkspace(null)
        return
      }

      if (data?.error === 'archived') {
        setWorkspace({ archived: true, title: data.title })
        return
      }

      if (data?.error === 'not_enrolled') {
        setWorkspace({
          needsEnrollment: true,
          title: data.title,
          status: data.status,
        })
        return
      }

      setWorkspace(data)

      const visibleSections = (data.sections ?? []).filter((section) => section.visible !== false)
      setActiveSectionId((current) => {
        if (current && visibleSections.some((section) => section.id === current)) {
          return current
        }

        return visibleSections[0]?.id || ''
      })

      const initialDrafts = {}
      for (const section of visibleSections) {
        if (section.response) {
          initialDrafts[section.id] = section.response
        }
      }
      setDraftValues(initialDrafts)
    } catch (loadError) {
      setError(loadError.message || 'No se pudo cargar el espacio.')
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [code])

  useEffect(() => {
    loadWorkspace()
  }, [loadWorkspace])

  useEffect(() => {
    if (
      !workspace ||
      workspace.needsAuth ||
      workspace.needsEnrollment ||
      workspace.archived ||
      !workspace.participant
    ) {
      return undefined
    }

    touchWorkspacePresence(code).catch(() => {})

    const interval = window.setInterval(() => {
      touchWorkspacePresence(code).catch(() => {})
      loadWorkspace({ silent: true }).catch(() => {})
    }, 30_000)

    return () => window.clearInterval(interval)
  }, [code, loadWorkspace, workspace])

  async function handleAttendanceSubmit(payload) {
    setAttendanceSubmitting(true)
    setAttendanceError('')

    try {
      await submitWorkspaceAttendance(code, payload)
      await loadWorkspace({ silent: true })
    } catch (submitError) {
      setAttendanceError(submitError.message || 'No se pudo registrar la asistencia.')
    } finally {
      setAttendanceSubmitting(false)
    }
  }

  const showAttendanceModal = Boolean(
    workspace?.modules?.attendance_prompt && !workspace?.participant?.attendance_registered_at
  )

  async function handleJoined(displayName) {
    await joinWorkspace(code, displayName, true)
    await loadWorkspace()
  }

  const navigationMode = workspace?.settings?.navigation_mode ?? 'free'
  const sections = useMemo(
    () => (workspace?.sections ?? []).filter((section) => section.visible !== false),
    [workspace]
  )
  const { main: mainSections, closure: closureSections } = useMemo(
    () => partitionParticipantSections(sections),
    [sections]
  )

  const panelFinished = Boolean(workspace?.participant?.panel_finished_at)
  const closureActive = Boolean(workspace?.modules?.closure_survey_active)
  const closureEnabled = Boolean(
    workspace?.modules?.closure_survey_enabled ??
      workspace?.settings?.closure_survey?.enabled
  )
  const surveyComplete =
    panelFinished && closureActive && allClosureSectionsAnswered(closureSections)
  const showMainPanel = !panelFinished && mainSections.length > 0
  const showSurveyPanel = panelFinished && closureActive && closureSections.length > 0

  const activeIndex = sections.findIndex((section) => section.id === activeSectionId)
  const activeSection = sections[activeIndex] ?? sections[0]

  function isSectionLocked(sectionIndex) {
    if (navigationMode !== 'sequential' || sectionIndex === 0) {
      return false
    }

    const previous = sections[sectionIndex - 1]

    if (!previous || !isResponseSection(previous)) {
      return false
    }

    return !previous.response && !draftValues[previous.id]
  }

  async function handleSaveSection(section) {
    setSavingSectionId(section.id)
    setSaveMessage('')
    setError('')

    try {
      const value = draftValues[section.id] ?? section.response ?? {}
      await upsertWorkspaceResponse(code, section.id, value)
      setSaveMessage('Respuesta guardada.')
      await loadWorkspace({ silent: true })
    } catch (saveError) {
      setError(saveError.message || 'No se pudo guardar la respuesta.')
    } finally {
      setSavingSectionId('')
    }
  }

  async function handleFinalizePanel() {
    setFinishingPanel(true)
    setSaveMessage('')
    setError('')

    try {
      for (const section of mainSections) {
        if (!isResponseSection(section) || !section.can_edit || isClosureSurveySection(section)) {
          continue
        }

        const draft = draftValues[section.id]
        if (draft !== undefined) {
          await upsertWorkspaceResponse(code, section.id, draft)
        }
      }

      if (
        activeSection &&
        isResponseSection(activeSection) &&
        activeSection.can_edit &&
        !isClosureSurveySection(activeSection)
      ) {
        const value = draftValues[activeSection.id] ?? activeSection.response ?? {}
        await upsertWorkspaceResponse(code, activeSection.id, value)
      }

      await submitWorkspacePanelFinish(code)
      setSaveMessage('Panel de participación finalizado.')
      await loadWorkspace()
    } catch (finishError) {
      const message = finishError.message ?? ''
      if (
        message.includes('submit_workspace_panel_finish') ||
        message.includes('panel_finished_at') ||
        message.includes('does not exist')
      ) {
        setError(
          'Falta configuración en Supabase. El facilitador debe ejecutar supabase/workspaces_participant_finish.sql.'
        )
      } else {
        setError(message || 'No se pudo finalizar el panel.')
      }
    } finally {
      setFinishingPanel(false)
    }
  }

  if (loading) {
    return <p className="auth-loading">Cargando espacio...</p>
  }

  if (error && !workspace) {
    return (
      <>
        <h1>Código inválido</h1>
        <p>{error}</p>
      </>
    )
  }

  if (workspace?.archived) {
    return (
      <>
        <h1>{workspace.title}</h1>
        <p className="participant-copy participant-wait">
          Este espacio ya no está disponible.
        </p>
      </>
    )
  }

  if (workspace?.needsAuth || workspace?.needsEnrollment) {
    return (
      <WorkspaceParticipantAuth
        code={code}
        workspaceTitle={workspace.title}
        onJoined={handleJoined}
      />
    )
  }

  if (workspace?.status === 'paused') {
    return (
      <>
        <h1>{workspace.title}</h1>
        <p className="participant-copy participant-wait">
          El espacio está pausado temporalmente. Vuelve más tarde.
        </p>
      </>
    )
  }

  const hasGroupSections = (workspace?.sections ?? []).some(
    (section) => section.scope === 'group' && !isClosureSurveySection(section)
  )
  const awaitingGroup = !workspace?.participant?.group_id && hasGroupSections

  if (panelFinished && closureEnabled && !closureActive) {
    return (
      <div className="workspace-participant-shell">
        <header className="workspace-participant-head">
          <h1>{workspace.title}</h1>
        </header>
        <div className="auth-panel workspace-participant-finished">
          <h2>Panel de participación finalizado</h2>
          <p className="participant-copy">
            Enviaste tu trabajo. El facilitador activará pronto la encuesta de satisfacción;
            esta página se actualizará sola (cada 30 s).
          </p>
        </div>
        <p className="workspace-powered-by">Powered by KitPOP</p>
      </div>
    )
  }

  if (panelFinished && !closureEnabled) {
    return (
      <div className="workspace-participant-shell">
        <header className="workspace-participant-head">
          <h1>{workspace.title}</h1>
        </header>
        <div className="auth-panel workspace-participant-finished">
          <h2>¡Gracias por participar!</h2>
          <p className="participant-copy">
            Finalizaste tu panel de participación. Ya no hay actividades pendientes.
          </p>
        </div>
        <p className="workspace-powered-by">Powered by KitPOP</p>
      </div>
    )
  }

  if (surveyComplete) {
    return (
      <div className="workspace-participant-shell">
        <header className="workspace-participant-head">
          <h1>{workspace.title}</h1>
        </header>
        <div className="auth-panel workspace-participant-finished">
          <h2>Encuesta enviada</h2>
          <p className="participant-copy">
            Gracias por completar la encuesta de satisfacción. Tu participación ha quedado
            registrada.
          </p>
        </div>
        <p className="workspace-powered-by">Powered by KitPOP</p>
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <>
        <h1>{workspace.title}</h1>
        {awaitingGroup && (
          <p className="participant-copy participant-wait">
            Estás inscrito/a. El facilitador te asignará a un grupo pronto.
          </p>
        )}
        <p className="participant-copy participant-wait">
          El facilitador aún no ha publicado bloques en este espacio.
        </p>
        <p className="workspace-powered-by">Powered by KitPOP</p>
      </>
    )
  }

  return (
    <div className="workspace-participant-shell">
      <header className="workspace-participant-head">
        <h1>{workspace.title}</h1>
        {panelFinished && closureActive ? (
          <p className="participant-copy workspace-survey-banner">
            Encuesta de satisfacción — responde las preguntas siguientes.
          </p>
        ) : null}
        {workspace.description ? (
          <WorkspaceRichContent
            html={workspace.description}
            className="workspace-participant-description"
          />
        ) : null}
        {Array.isArray(workspace.settings?.dates) && workspace.settings.dates.length > 0 ? (
          <p className="interactive-item-meta workspace-participant-dates">
            {workspace.settings.dates
              .map((entry) => {
                try {
                  return new Date(`${entry}T12:00:00`).toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                } catch {
                  return entry
                }
              })
              .join(' · ')}
          </p>
        ) : null}
        {workspace.group?.name && (
          <p className="interactive-item-meta">
            {workspace.group.name}
            {workspace.participant.is_group_editor ? ' · Editor del grupo' : ''}
          </p>
        )}
        {awaitingGroup && !panelFinished && (
          <p className="participant-copy participant-wait">
            Puedes revisar todas las actividades del espacio. Las actividades grupales están
            en solo lectura hasta que el facilitador te asigne a un grupo.
          </p>
        )}
      </header>

      {error && <div className="auth-message error">{error}</div>}
      {saveMessage && <div className="auth-message success">{saveMessage}</div>}

      <div className="workspace-participant-layout">
        <nav className="workspace-section-nav" aria-label="Secciones">
          {sections.map((section, index) => {
            const locked = isSectionLocked(index)
            const moduleName = resolveSectionModuleName(sections, index)
            const showModuleInNav =
              shouldShowModuleHeader(sections, index) && moduleName

            return (
              <button
                key={section.id}
                type="button"
                className={`workspace-section-nav-item ${
                  activeSectionId === section.id ? 'on' : ''
                } ${locked ? 'locked' : ''}`}
                disabled={locked}
                onClick={() => setActiveSectionId(section.id)}
              >
                {showModuleInNav ? (
                  <span className="workspace-nav-module">{moduleName}</span>
                ) : null}
                <span>
                  {index + 1}. {section.title}
                  {section.response ? ' ✓' : ''}
                </span>
              </button>
            )
          })}
        </nav>

        {activeSection && (
          <section className="workspace-section-panel auth-panel">
            {shouldShowModuleHeader(sections, activeIndex) && (
              <p className="workspace-module-banner">
                {resolveSectionModuleName(sections, activeIndex)}
              </p>
            )}

            <div className="workspace-section-head">
              <h2>{activeSection.title}</h2>
              <span className="profile-badge">
                {isClosureSurveySection(activeSection)
                  ? 'Encuesta'
                  : activeSection.scope === 'group'
                    ? 'Grupal'
                    : 'Individual'}
              </span>
            </div>

            {activeSection.scope === 'group' &&
              !activeSection.can_edit &&
              !isClosureSurveySection(activeSection) && (
              <p className="participant-copy participant-wait">
                Solo lectura — puedes revisar esta actividad grupal; el editor del grupo
                registra las respuestas compartidas.
              </p>
            )}

            <WorkspaceSectionInput
              section={activeSection}
              value={draftValues[activeSection.id] ?? activeSection.response ?? {}}
              disabled={!activeSection.can_edit || activeSection.section_type === 'info'}
              onChange={(value) =>
                setDraftValues((current) => ({ ...current, [activeSection.id]: value }))
              }
            />

            {isResponseSection(activeSection) && activeSection.can_edit && (
              <div className="form-actions workspace-participant-actions">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={savingSectionId === activeSection.id || finishingPanel}
                  onClick={() => handleSaveSection(activeSection)}
                >
                  {savingSectionId === activeSection.id ? 'Guardando...' : 'Guardar respuesta'}
                </button>

                {navigationMode === 'sequential' && activeIndex < sections.length - 1 && (
                  <button
                    type="button"
                    className="timer-btn timer-btn-secondary"
                    disabled={isSectionLocked(activeIndex + 1)}
                    onClick={() => setActiveSectionId(sections[activeIndex + 1].id)}
                  >
                    Siguiente sección →
                  </button>
                )}
              </div>
            )}

            {(!isResponseSection(activeSection) || !activeSection.can_edit) &&
              navigationMode === 'sequential' &&
              activeIndex < sections.length - 1 && (
              <div className="form-actions workspace-participant-actions">
                <button
                  type="button"
                  className="timer-btn timer-btn-secondary"
                  disabled={isSectionLocked(activeIndex + 1)}
                  onClick={() => setActiveSectionId(sections[activeIndex + 1].id)}
                >
                  Siguiente sección →
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {showMainPanel && (
        <div className="workspace-participant-finish-bar auth-panel">
          <div className="workspace-participant-finish-copy">
            <h3>Enviar tu trabajo</h3>
            <p className="field-hint">
              Cuando hayas completado las actividades, finaliza tu panel. Después podrás
              responder la encuesta de satisfacción si el facilitador la activa.
            </p>
          </div>
          <button
            type="button"
            className="workspace-participant-finish-btn"
            disabled={finishingPanel}
            onClick={handleFinalizePanel}
          >
            {finishingPanel ? 'Finalizando...' : 'Finalizar panel de participación'}
          </button>
        </div>
      )}

      {showSurveyPanel && (
        <div className="workspace-participant-finish-bar auth-panel workspace-participant-survey-bar">
          <p className="field-hint">
            Encuesta de satisfacción — guarda cada respuesta y avanza por el menú lateral.
          </p>
        </div>
      )}

      <p className="workspace-powered-by">Powered by KitPOP</p>

      {showAttendanceModal && (
        <WorkspaceAttendanceModal
          submitting={attendanceSubmitting}
          error={attendanceError}
          onSubmit={handleAttendanceSubmit}
        />
      )}
    </div>
  )
}
