import { Link } from 'react-router-dom'

import { getPlanLabel, getUserPlan, hasPaidPlan } from '../../utils/planLimits'

export default function CompactPlanStrip({ profile }) {
  const planId = getUserPlan(profile)
  const isPaid = hasPaidPlan(profile)

  return (
    <div className="compact-plan-strip">
      <span>
        Plan: <strong>{getPlanLabel(profile)}</strong>
      </span>
      {!isPaid && (
        <Link to="/perfil?tab=plan" className="compact-plan-upgrade">
          Upgrade
        </Link>
      )}
      {isPaid && planId === 'pro' && (
        <Link to="/perfil?tab=plan" className="compact-plan-upgrade subtle">
          Ver plan
        </Link>
      )}
    </div>
  )
}
