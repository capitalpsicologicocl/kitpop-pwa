import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import ActivityList from '../components/categories/ActivityList'
import { useAuth } from '../context/AuthContext'
import { searchActivitiesAsync } from '../utils/searchActivities'

export default function SearchResults() {
  const { favoriteSlugs } = useAuth()
  const [searchParams] = useSearchParams()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const query = searchParams.get('q')?.trim() ?? ''
  const categorySlug = searchParams.get('categoria') ?? 'all'
  const duration = searchParams.get('duracion') ?? 'all'
  const favoritesOnly = searchParams.get('favoritas') === '1'

  useEffect(() => {
    if (!query && !favoritesOnly) {
      setResults([])
      setLoading(false)
      return
    }

    let mounted = true
    setLoading(true)

    searchActivitiesAsync({
      query,
      categorySlug,
      duration,
      favoritesOnly,
      favoriteSlugs,
    })
      .then((items) => {
        if (mounted) {
          setResults(items)
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [query, categorySlug, duration, favoritesOnly, favoriteSlugs])

  const emptyDescription = useMemo(() => {
    if (favoritesOnly && favoriteSlugs.length === 0) {
      return 'Aún no tienes actividades favoritas guardadas.'
    }

    return 'Prueba con otra palabra clave o revisa la ortografía.'
  }, [favoritesOnly, favoriteSlugs.length])

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
            {loading ? 'Buscando…' : `${results.length} actividades encontradas en todo KitPOP.`}
          </p>

          <ActivityList
            items={results}
            loading={loading}
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
