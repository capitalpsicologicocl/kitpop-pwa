import { Link } from 'react-router-dom'

export default function PlanUpgradeHint() {
  return (
    <p className="plan-upgrade-hint">
      <Link to="/perfil#plan">Ver plan Pro</Link> para crear sin límites.
    </p>
  )
}

export function isPlanLimitMessage(message = '') {
  return message.toLowerCase().includes('límite')
}
