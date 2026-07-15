import { getFoundingSlots } from './_lib/founder.js'
import { getSupabaseAdmin } from './_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const foundingSlots = await getFoundingSlots(supabaseAdmin)

    return res.status(200).json(foundingSlots)
  } catch (error) {
    console.error('[founder-status]', error)
    return res.status(500).json({
      error: error.message || 'No se pudo consultar cupos Fundador.',
    })
  }
}
