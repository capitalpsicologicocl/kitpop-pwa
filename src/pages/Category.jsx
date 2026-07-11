import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { categories } from '../data/categories'
import ActivityList from '../components/categories/ActivityList'
import PermaFilters from '../components/categories/PermaFilters'

export default function Category() {
  const { slug } = useParams()
  const [permaFilter, setPermaFilter] = useState('all')

  const category = categories.find(
    (item) => item.slug === slug
  )

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
      <Link to="/" className="back-btn">
        ← Volver
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
        categorySlug={category.slug}
        categoryIcon={category.icon}
        permaFilter={category.showPermaFilter ? permaFilter : 'all'}
      />
    </main>
  )
}
