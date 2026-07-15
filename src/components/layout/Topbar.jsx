import { Link } from 'react-router-dom'

import KitpopIcon from '../../icons/kitpopIcons'
import ThemeToggle from '../ui/ThemeToggle'

export default function Topbar({ onOpenMenu }) {
  return (
    <header className="topbar">
      <Link to="/" className="logo-wrap">
        <img src="/kitpop-logo.png" alt="KitPOP de Facilitación" />
      </Link>

      <div className="topbar-actions">
        <ThemeToggle />

        <button
          className="kp-menu-toggle"
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
        >
          <KitpopIcon name="menu" size={22} />
        </button>
      </div>
    </header>
  )
}
