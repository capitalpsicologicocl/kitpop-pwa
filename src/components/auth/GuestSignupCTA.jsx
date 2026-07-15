import { Link } from 'react-router-dom'

const COPY = {
  default: {
    title: 'Accede al banco completo',
    description:
      'Ya puedes explorar categorías y actividades sin cuenta. Regístrate gratis para favoritos, bitácora y diseño de talleres con IA.',
  },
  category: {
    title: 'Guarda tus dinámicas favoritas',
    description:
      'Crea una cuenta Explorer gratis para marcar actividades de esta categoría y armar talleres con IA.',
  },
  activity: {
    title: 'Lleva esta dinámica a tu taller',
    description:
      'Regístrate gratis para guardar favoritos, escribir en bitácora y exportar guías completas con KitPOP Pro.',
  },
}

export default function GuestSignupCTA({ variant = 'default' }) {
  const copy = COPY[variant] ?? COPY.default

  return (
    <section className="home-guest-cta">
      <div className="home-panel">
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>

        <div className="auth-actions">
          <Link to="/registro" className="btn-primary btn-link">
            Crear cuenta gratis
          </Link>
          <Link to="/login" className="btn-secondary btn-link">
            Iniciar sesión
          </Link>
          <Link to="/perfil?tab=plan" className="btn-secondary btn-link">
            Ver KitPOP Pro
          </Link>
        </div>
      </div>
    </section>
  )
}
