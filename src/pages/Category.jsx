import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import ActivityList from '../components/categories/ActivityList'
import PermaFilters from '../components/categories/PermaFilters'
import GuestSignupCTA from '../components/auth/GuestSignupCTA'
import { categories } from '../data/categories'
import { useAuth } from '../context/AuthContext'
import { useCategoryActivities } from '../hooks/useContent'

export default function Category() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [permaFilter, setPermaFilter] = useState('all')

  const category = categories.find((item) => item.slug === slug)
  const { activities, loading } = useCategoryActivities(slug)

  const visibleActivities = useMemo(() => {
    if (permaFilter === 'all') {
      return activities
    }

    return activities.filter((activity) => activity.permaElement === permaFilter)
  }, [activities, permaFilter])

  if (!category) {
    return (
      <main id="cat-view" className="fade-in">
        <Link to="/" className="back-btn">
          ← Volver
        </Link>

        <h1 className="cv-title">
          Categoría no encontrada
        </h1>

        <p className="cv-desc">
          La categoría que intentas abrir no existe o todavía no está disponible.
        </p>
      </main>
    )
  }

  return (
    <main id="cat-view" className="fade-in">
      <Link to="/categorias" className="back-btn">
        ← Volver a categorías
      </Link>

      <h1 className="cv-title">
        {category.title}
      </h1>

      <p className="cv-desc">
        {category.description}
      </p>

      {category.showPermaFilter && (
        <PermaFilters
          value={permaFilter}
          onChange={setPermaFilter}
        />
      )}

      <ActivityList
        items={visibleActivities}
        loading={loading}
        categorySlug={category.slug}
        categoryIcon={category.icon}
        permaFilter="all"
      />

      {!user && <GuestSignupCTA variant="category" />}
    </main>
  )
}
