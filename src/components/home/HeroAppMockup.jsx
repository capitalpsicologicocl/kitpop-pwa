export default function HeroAppMockup() {
  return (
    <div className="hero-mockup" aria-hidden="true">
      <div className="hero-mockup-shell">
        <div className="hero-mockup-topbar">
          <span />
          <span />
          <span />
        </div>
        <div className="hero-mockup-body">
          <div className="hero-mockup-chip">Diseño de taller</div>
          <div className="hero-mockup-card hero-mockup-card-accent">
            <strong>Sesión 1 · Comunicación</strong>
            <span>8 h programadas · 10 h diseñadas</span>
          </div>
          <div className="hero-mockup-card">
            <strong>Activación Rápida</strong>
            <span>10 min · Actividad KitPOP</span>
          </div>
          <div className="hero-mockup-card">
            <strong>Módulo teórico</strong>
            <span>25 min · Escucha activa</span>
          </div>
          <div className="hero-mockup-progress">
            <span style={{ width: '72%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
