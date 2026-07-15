import CategoryGrid from '../components/home/CategoryGrid'
import GuestSignupCTA from '../components/auth/GuestSignupCTA'
import { CategoryGridSkeleton } from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'

export default function Categories() {
  const { user, loading } = useAuth()

  return (
    <main id="categories-view" className="fade-in">
      <div className="page-head">
        <h1 className="cv-title">Categorías</h1>
        <p className="cv-desc">
          Explora el banco de actividades por tema — sin cuenta puedes leer guías y dinámicas.
        </p>
      </div>

      {loading ? <CategoryGridSkeleton /> : <CategoryGrid />}

      {!user && <GuestSignupCTA variant="category" />}
    </main>
  )
}
