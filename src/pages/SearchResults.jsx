import { Link, useSearchParams } from 'react-router-dom'

import ActivityList from '../components/categories/ActivityList'
import { useAuth } from '../context/AuthContext'
import { searchActivities } from '../utils/searchActivities'

export default function SearchResults() {
  const { favoriteSlugs } = useAuth()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const categorySlug = searchParams.get('categoria') ?? 'all'
  const duration = searchParams.get('duracion') ?? 'all'
  const favoritesOnly = searchParams.get('favoritas') === '1'

  const results = query || favoritesOnly
    ? searchActivities({
        query,
        categorySlug,
        duration,
        favoritesOnly,
        favoriteSlugs,
      })
    : []

  const emptyDescription = favoritesOnly && favoriteSlugs.length === 0
    ? 'Aún no tienes actividades favoritas guardadas.'
    : 'Prueba con otra palabra clave o revisa la ortografía.'

  return (
    <main id="cat-view" className="fade-in">
      <Link to="/" className="back-btn">
        ← Volver
      </Link>

      {query || favoritesOnly ? (
        <>
          <h1 className="cv-title">
            {query
              ? `Resultados para “${query}”`
              : 'Actividades favoritas'}
          </h1>

          <p className="cv-desc">
            {results.length} actividades encontradas en todo KitPOP.
          </p>

          <ActivityList
            items={results}
            useActivityIcons
            emptyTitle="Sin resultados"
            emptyDescription={emptyDescription}
            emptyVariant="search"
          />
        </>
      ) : (
        <>
          <h1 className="cv-title">Buscar actividades</h1>
          <p className="cv-desc">
            Escribe una palabra en el buscador del inicio o del menú lateral.
          </p>
        </>
      )}
    </main>
  )
}
