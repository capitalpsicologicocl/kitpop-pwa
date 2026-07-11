import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { getActivityBySlug } from '../data/kitpopAdapter'
import ActivityGuide from '../components/activity/ActivityGuide'
import ActivityHero from '../components/activity/ActivityHero'
import ActivityJournalForm from '../components/activity/ActivityJournalForm'
import ActivityScience from '../components/activity/ActivityScience'
import ActivityTabs from '../components/activity/ActivityTabs'
import ActivityTimer from '../components/activity/ActivityTimer'

export default function Activity() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const { favoriteSlugs, toggleFavorite } = useAuth()
  const activity = getActivityBySlug(slug)
  const [activeTab, setActiveTab] = useState('guide')
  const [favoriteError, setFavoriteError] = useState('')

  const isFavorite = favoriteSlugs.includes(slug)
  const showTimer = activity?.categorySlug !== 'fortalezas'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setActiveTab('guide')
    setFavoriteError('')
  }, [slug])

  useEffect(() => {
    if (!showTimer && activeTab === 'timer') {
      setActiveTab('guide')
    }
  }, [showTimer, activeTab])

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

  return (
    <main id="act-view" className="fade-in">
      <Link
        to={`/categoria/${activity.categorySlug}`}
        className="back-btn"
      >
        ← Volver a la categoría
      </Link>

      {favoriteError && (
        <div className="auth-message error">{favoriteError}</div>
      )}

      <ActivityHero
        kitpop={kitpop}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
      />

      <ActivityTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showTimer={showTimer}
      />

      {activeTab === 'guide' && <ActivityGuide kitpop={kitpop} />}
      {activeTab === 'timer' && showTimer && (
        <ActivityTimer metas={kitpop.metas ?? []} />
      )}
      {activeTab === 'science' && <ActivityScience kitpop={kitpop} />}
      {activeTab === 'journal' && (
        <ActivityJournalForm
          activitySlug={activity.slug}
          activityTitle={activity.title}
        />
      )}
    </main>
  )
}
