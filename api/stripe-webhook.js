import {
  getStripe,
  syncProfileFromSubscription,
} from '../_lib/stripe.js'
import { getSupabaseAdmin, readRawBody } from '../_lib/supabase.js'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function handleCheckoutCompleted(session, stripe, supabaseAdmin) {
  const userId = session.client_reference_id || session.metadata?.user_id

  if (!userId) {
    return
  }

  if (session.customer) {
    await supabaseAdmin
      .from('profiles')
      .update({
        stripe_customer_id:
          typeof session.customer === 'string'
            ? session.customer
            : session.customer.id,
      })
      .eq('id', userId)
  }

  if (!session.subscription) {
    return
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription)
  await syncProfileFromSubscription(subscription, supabaseAdmin)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Missing STRIPE_WEBHOOK_SECRET.' })
  }

  try {
    const stripe = getStripe()
    const supabaseAdmin = getSupabaseAdmin()
    const signature = req.headers['stripe-signature']
    const rawBody = await readRawBody(req)

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, stripe, supabaseAdmin)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await syncProfileFromSubscription(event.data.object, supabaseAdmin)
        break

      case 'customer.subscription.deleted':
        await syncProfileFromSubscription(event.data.object, supabaseAdmin)
        break

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id

        if (customerId) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_customer_id', customerId)
        }
        break
      }

      default:
        break
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('stripe-webhook', error)
    return res.status(400).json({
      error: error.message || 'Webhook error',
    })
  }
}
