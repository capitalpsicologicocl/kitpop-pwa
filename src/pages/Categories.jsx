import { Link } from 'react-router-dom'

import CategoryGrid from '../components/home/CategoryGrid'
import { useAuth } from '../context/AuthContext'

export default function Categories() {
  const { user } = useAuth()

  return (
    <main id="categories-view" className="fade-in">
      <div className="page-head">
        <h1 className="cv-title">Categorías</h1>
        <p className="cv-desc">
          Explora el banco de actividades por tema — sin cuenta puedes leer guías y dinámicas.
        </p>
      </div>

      <CategoryGrid />

      {!user && (
        <section className="home-guest-cta">
          <div className="home-panel">
            <h2>Guarda favoritos y diseña talleres</h2>
            <p>
              Crea tu cuenta Explorer gratis para favoritos, bitácora y diseño con IA.
            </p>
            <div className="auth-actions">
              <Link to="/registro" className="btn-primary btn-link">
                Crear cuenta gratis
              </Link>
              <Link to="/login" className="btn-secondary btn-link">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
