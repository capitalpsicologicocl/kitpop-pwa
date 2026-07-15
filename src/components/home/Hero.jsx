import { categories } from '../../data/categories'
import { ACTIVITY_COUNT } from '../../data/categoriesIndex'
import HeroAppMockup from './HeroAppMockup'

export default function Hero() {
  const categoryCount = categories.length
  const activityCount = ACTIVITY_COUNT

  return (
    <section className="hero hero-premium">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-logo-inbox">
            <img src="/kitpop-logo.png" alt="KitPOP de Facilitación" />
          </div>

          <div className="hero-badge">Banco de actividades</div>

          <h1 className="hero-t">
            Facilita mejor,<br />
            <em>conecta más profundo</em>
          </h1>

          <p className="hero-d">
            Dinámicas, estructuras y herramientas para facilitar reuniones,
            talleres y capacitaciones con propósito y presencia real.
          </p>

          <div className="hero-stats">
            <div>
              <span className="stat-n">{activityCount}</span>
              <span className="stat-l">Actividades</span>
            </div>
            <div>
              <span className="stat-n">{categoryCount}</span>
              <span className="stat-l">Categorías</span>
            </div>
            <div>
              <span className="stat-n">100%</span>
              <span className="stat-l">Con guía facilitador/a</span>
            </div>
          </div>
        </div>

        <HeroAppMockup />
      </div>
    </section>
  )
}
