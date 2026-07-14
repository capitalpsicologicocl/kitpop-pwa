import {
  getPayPalSubscription,
  syncProfileFromPayPalSubscription,
  verifyPayPalWebhook,
} from './_lib/paypal.js'
import { getSupabaseAdmin, readRawBody } from './_lib/supabase.js'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function syncSubscriptionById(subscriptionId, supabaseAdmin) {
  if (!subscriptionId) {
    return
  }

  const subscription = await getPayPalSubscription(subscriptionId)
  await syncProfileFromPayPalSubscription(subscription, supabaseAdmin)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const rawBody = await readRawBody(req)
    const event = await verifyPayPalWebhook(req, rawBody)
    const supabaseAdmin = getSupabaseAdmin()
    const resource = event.resource ?? {}
    const subscriptionId = resource.id || resource.billing_agreement_id

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.UPDATED':
      case 'BILLING.SUBSCRIPTION.RE-ACTIVATED':
        await syncSubscriptionById(subscriptionId, supabaseAdmin)
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await syncSubscriptionById(subscriptionId, supabaseAdmin)
        break

      case 'PAYMENT.SALE.COMPLETED':
        if (resource.billing_agreement_id) {
          await syncSubscriptionById(resource.billing_agreement_id, supabaseAdmin)
        }
        break

      default:
        break
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('paypal-webhook', error)
    return res.status(400).json({
      error: error.message || 'Webhook error',
    })
  }
}
