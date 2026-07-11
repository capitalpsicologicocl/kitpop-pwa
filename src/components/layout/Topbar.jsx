import { Link } from 'react-router-dom'

export default function Topbar({ onOpenMenu }) {
  return (
    <header className="topbar">
      <Link to="/" className="logo-wrap">
        <img src="/kitpop-logo.png" alt="KitPOP de Facilitación" />
      </Link>

      <button
        className="kp-menu-toggle"
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menú"
      >
        ☰
      </button>
    </header>
  )
}