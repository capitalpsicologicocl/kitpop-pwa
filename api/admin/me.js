import { isAdminEmail, requireAdminUser } from '../_lib/adminAuth.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await requireAdminUser(req)

    return res.status(200).json({
      isAdmin: isAdminEmail(user.email),
      email: user.email,
    })
  } catch (error) {
    const status = error.statusCode || 500

    return res.status(status).json({
      error: error.message || 'No se pudo verificar permisos.',
      isAdmin: false,
    })
  }
}
