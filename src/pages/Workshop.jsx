import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Workshop() {
  const [showResult, setShowResult] = useState(false)

  return (
    <main id="workshop-view" className="fade-in">
      <Link to="/" className="back-btn">
        ← Volver
      </Link>

      <div className="page-head">
        <h1 className="cv-title">Diseñador de talleres</h1>
        <p className="cv-desc">
          Asistente para estructurar workshops, capacitaciones y procesos
          formativos con actividades KitPOP.
        </p>
      </div>

      <div className="home-panel">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="workshop-name">Nombre</label>
            <input id="workshop-name" defaultValue="Liderazgo positivo" />
          </div>

          <div className="field">
            <label htmlFor="workshop-audience">Público objetivo</label>
            <input id="workshop-audience" defaultValue="Jefaturas" />
          </div>

          <div className="field">
            <label htmlFor="workshop-people">Personas</label>
            <input id="workshop-people" type="number" defaultValue={20} />
          </div>

          <div className="field">
            <label htmlFor="workshop-modality">Modalidad</label>
            <select id="workshop-modality" defaultValue="Presencial">
              <option>Presencial</option>
              <option>Virtual</option>
              <option>Híbrida</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="workshop-sessions">Sesiones</label>
            <input id="workshop-sessions" type="number" defaultValue={2} />
          </div>

          <div className="field">
            <label htmlFor="workshop-hours">Horas por sesión</label>
            <input id="workshop-hours" type="number" defaultValue={3} />
          </div>

          <div className="field full">
            <label htmlFor="workshop-objective">Objetivo y contenidos</label>
            <textarea id="workshop-objective" defaultValue="Fortalecer liderazgo positivo, conexión y bienestar." />
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowResult(true)}
        >
          Generar propuesta con IA
        </button>

        {showResult && (
          <div className="workshop-result">
            <div className="content-card">
              <h3>Sesión 1</h3>
              <p>
                Conexión y fortalezas: Ronda de Buenas Noticias, Mapa de
                Fortalezas y Apreciograma.
              </p>
            </div>

            <div className="content-card">
              <h3>Sesión 2</h3>
              <p>
                Propósito y transferencia: Historias de Impacto, Escalera del
                Proyecto y Cierre Positivo.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
