import { Link } from 'react-router-dom'

export default function GuestLoginGate({ featureLabel, children }) {
  return (
    <div className="guest-login-gate auth-panel">
      <h3>{featureLabel} requiere cuenta</h3>
      <p>Inicia sesión gratis para guardar favoritos, bitácora y diseñar talleres con IA.</p>
      <div className="auth-actions">
        <Link to="/registro" className="btn-primary btn-link">
          Crear cuenta
        </Link>
        <Link to="/login" className="btn-secondary btn-link">
          Iniciar sesión
        </Link>
      </div>
    </div>
  )
}
