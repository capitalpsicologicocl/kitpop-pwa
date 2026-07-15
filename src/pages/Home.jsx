import { Link } from 'react-router-dom'

import Hero from '../components/home/Hero'
import CategoryGrid from '../components/home/CategoryGrid'
import QuickGrid from '../components/home/QuickGrid'
import { useAuth } from '../context/AuthContext'

function HomeGuestCTA() {
  return (
    <section className="home-guest-cta">
      <div className="home-panel">
        <h2>Accede al banco completo</h2>
        <p>
          Ya puedes explorar categorías y actividades sin cuenta. Regístrate gratis
          para favoritos, bitácora y diseño de talleres con IA.
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
  )
}

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main id="home" className="fade-in">
        <p className="auth-loading">Cargando...</p>
      </main>
    )
  }

  return (
    <main id="home" className="fade-in">
      <Hero />
      <CategoryGrid />
      {user ? <QuickGrid /> : <HomeGuestCTA />}
    </main>
  )
}
