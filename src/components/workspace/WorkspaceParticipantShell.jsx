import { useCallback, useEffect, useMemo, useState } from 'react'

import WorkspaceParticipantAuth from './WorkspaceParticipantAuth'
import WorkspaceSectionInput from './WorkspaceSectionInput'
import {
  getWorkspaceForParticipant,
  joinWorkspace,
  upsertWorkspaceResponse,
} from '../../services/workspaceService'
import { isResponseSection } from '../../utils/workspaceHelpers'

export default function WorkspaceParticipantShell({ code }) {
  const [workspace, setWorkspace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSectionId, setActiveSectionId] = useState('')
  const [draftValues, setDraftValues] = useState({})
  const [savingSectionId, setSavingSectionId] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  const loadWorkspace = useCallback(async () => {
    setLoading(true)
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
      setActiveSectionId((current) => current || visibleSections[0]?.id || '')

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
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    loadWorkspace()
  }, [loadWorkspace])

  async function handleJoined(displayName) {
    await joinWorkspace(code, displayName, true)
    await loadWorkspace()
  }

  const navigationMode = workspace?.settings?.navigation_mode ?? 'free'
  const sections = useMemo(
    () => (workspace?.sections ?? []).filter((section) => section.visible !== false),
    [workspace]
  )
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
      await loadWorkspace()
    } catch (saveError) {
      setError(saveError.message || 'No se pudo guardar la respuesta.')
    } finally {
      setSavingSectionId('')
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
    (section) => section.scope === 'group'
  )
  const awaitingGroup = !workspace?.participant?.group_id && hasGroupSections

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
        {workspace.group?.name && (
          <p className="interactive-item-meta">
            {workspace.group.name}
            {workspace.participant.is_group_editor ? ' · Editor del grupo' : ''}
          </p>
        )}
        {awaitingGroup && (
          <p className="participant-copy participant-wait">
            Puedes avanzar en las secciones individuales. El facilitador te asignará a un
            grupo para las actividades grupales.
          </p>
        )}
      </header>

      {error && <div className="auth-message error">{error}</div>}
      {saveMessage && <div className="auth-message success">{saveMessage}</div>}

      <div className="workspace-participant-layout">
        <nav className="workspace-section-nav" aria-label="Secciones">
          {sections.map((section, index) => {
            const locked = isSectionLocked(index)

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
                {index + 1}. {section.title}
                {section.response ? ' ✓' : ''}
              </button>
            )
          })}
        </nav>

        {activeSection && (
          <section className="workspace-section-panel auth-panel">
            <div className="workspace-section-head">
              <h2>{activeSection.title}</h2>
              <span className="profile-badge">
                {activeSection.scope === 'group' ? 'Grupal' : 'Individual'}
              </span>
            </div>

            {activeSection.scope === 'group' && !activeSection.can_edit && (
              <p className="participant-copy participant-wait">
                Solo lectura — el editor del grupo registra las respuestas compartidas.
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
              <button
                type="button"
                className="btn-primary"
                disabled={savingSectionId === activeSection.id}
                onClick={() => handleSaveSection(activeSection)}
              >
                {savingSectionId === activeSection.id ? 'Guardando...' : 'Guardar respuesta'}
              </button>
            )}

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
          </section>
        )}
      </div>

      <p className="workspace-powered-by">Powered by KitPOP</p>
    </div>
  )
}
