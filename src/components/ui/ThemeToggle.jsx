import KitpopIcon from '../../icons/kitpopIcons'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { resolved, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      className={`kp-theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={resolved === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={resolved === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      <KitpopIcon name={resolved === 'dark' ? 'sun' : 'moon'} size={20} />
    </button>
  )
}
