import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/interactivo', label: 'Resumen', end: true },
  { to: '/interactivo/espacios', label: 'Espacios' },
  { to: '/interactivo/encuestas', label: 'Encuestas' },
  { to: '/interactivo/en-vivo', label: 'En vivo' },
]

export default function InteractiveNav() {
  const location = useLocation()

  return (
    <nav className="interactive-nav" aria-label="Espacio interactivo">
      {LINKS.map((link) => {
        const isActive = link.end
          ? location.pathname === link.to
          : location.pathname.startsWith(link.to)

        return (
          <Link
            key={link.to}
            to={link.to}
            className={`interactive-nav-link ${isActive ? 'on' : ''}`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
