export default function Hero() {
  return (
    <section className="hero">
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
          <span className="stat-n">59</span>
          <span className="stat-l">Actividades</span>
        </div>
        <div>
          <span className="stat-n">8</span>
          <span className="stat-l">Categorías</span>
        </div>
        <div>
          <span className="stat-n">100%</span>
          <span className="stat-l">Con guía facilitador/a</span>
        </div>
      </div>
    </section>
  )
}