import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { getActivityBySlug } from '../data/kitpopAdapter'
import ExportActions from '../components/export/ExportActions'
import GuestSignupCTA from '../components/auth/GuestSignupCTA'
import ActivityGuide from '../components/activity/ActivityGuide'
import ActivityHero from '../components/activity/ActivityHero'
import ActivityJournalForm from '../components/activity/ActivityJournalForm'
import ActivityScience from '../components/activity/ActivityScience'
import ActivityTabs from '../components/activity/ActivityTabs'
import ActivityTimer from '../components/activity/ActivityTimer'
import {
  buildActivityGuideDocumentHtml,
  getActivityGuideFilename,
} from '../utils/activityExport'
import { downloadDocumentWord, printDocumentPdf } from '../utils/documentExport'

export default function Activity() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const { user, favoriteSlugs, toggleFavorite } = useAuth()
  const activity = getActivityBySlug(slug)
  const [activeTab, setActiveTab] = useState('guide')
  const [favoriteError, setFavoriteError] = useState('')

  const isFavorite = favoriteSlugs.includes(slug)
  const showTimer = !['fortalezas', 'facilitacion'].includes(activity?.categorySlug)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setActiveTab('guide')
    setFavoriteError('')
  }, [slug])

  async function handleToggleFavorite() {
    setFavoriteError('')

    try {
      await toggleFavorite(slug)
    } catch (error) {
      if (error.message === 'LOGIN_REQUIRED') {
        navigate('/login')
        return
      }

      setFavoriteError(error.message || 'No se pudo actualizar el favorito.')
    }
  }

  if (!activity) {
    return (
      <main id="act-view" className="fade-in">
        <Link to="/" className="back-btn">
          ← Volver
        </Link>

        <h1 className="cv-title">Actividad no encontrada</h1>

        <p className="cv-desc">
          La actividad que intentas abrir no existe o todavía no está disponible.
        </p>
      </main>
    )
  }

  const kitpop = activity.kitpop

  function handleDownloadWord() {
    const html = buildActivityGuideDocumentHtml(activity)
    downloadDocumentWord(html, getActivityGuideFilename(activity))
  }

  return (
    <main id="act-view" className="fade-in export-document">
      <Link
        to={`/categoria/${activity.categorySlug}`}
        className="back-btn"
      >
        ← Volver a la categoría
      </Link>

      <ExportActions
        onDownloadWord={handleDownloadWord}
        onPrintPdf={printDocumentPdf}
      />

      {favoriteError && (
        <div className="auth-message error">{favoriteError}</div>
      )}

      <ActivityHero
        kitpop={kitpop}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
      />

      <div className="activity-sticky-tools">
        <ActivityTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {showTimer && <ActivityTimer metas={kitpop.metas ?? []} />}
      </div>

      {activeTab === 'guide' && <ActivityGuide kitpop={kitpop} />}
      {activeTab === 'science' && <ActivityScience kitpop={kitpop} />}
      {activeTab === 'journal' && (
        <ActivityJournalForm
          activitySlug={activity.slug}
          activityTitle={activity.title}
        />
      )}

      {!user && <GuestSignupCTA variant="activity" />}
    </main>
  )
}
