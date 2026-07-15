import {
  handleAdminGrantPlan,
  handleAdminLookupUser,
  handleAdminMe,
} from './_lib/adminHandlers.js'

function resolveAction(req) {
  return String(req.query?.action || req.body?.action || '').trim()
}

export default async function handler(req, res) {
  const action = resolveAction(req)

  if (action === 'me') {
    return handleAdminMe(req, res)
  }

  if (action === 'lookup-user') {
    return handleAdminLookupUser(req, res)
  }

  if (action === 'grant-plan') {
    return handleAdminGrantPlan(req, res)
  }

  return res.status(400).json({
    error: 'Acción admin no válida. Usa action=me, lookup-user o grant-plan.',
  })
}
