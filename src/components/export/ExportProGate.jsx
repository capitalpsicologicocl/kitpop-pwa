import { Link } from 'react-router-dom'

import { canExportProContent } from '../../utils/planLimits'

export default function ExportProGate({ profile, featureLabel, children }) {
  if (canExportProContent(profile)) {
    return children
  }

  return (
    <div className="export-pro-gate auth-panel">
      <h3>Export {featureLabel} — KitPOP Pro</h3>
      <p>
        Diseña y revisa tu contenido en Explorer. Para descargar Word o PDF necesitas{' '}
        <strong>KitPOP Pro</strong> (desde USD 39/año o USD 29/año plan Fundador).
      </p>
      <Link to="/perfil?tab=plan" className="btn-primary btn-link">
        Ver planes Pro →
      </Link>
    </div>
  )
}
