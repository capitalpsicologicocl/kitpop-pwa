const PROCESSED = 'processed'
const PROCESSING = 'processing'
const FAILED = 'failed'

export async function claimWebhookEvent(supabaseAdmin, {
  provider,
  dedupeKey,
  eventId,
  eventType,
  payload,
}) {
  if (!dedupeKey) {
    return { claimed: true, eventRowId: null }
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('webhook_events')
    .insert({
      provider,
      dedupe_key: dedupeKey,
      event_id: eventId ?? null,
      event_type: eventType ?? null,
      status: PROCESSING,
      payload: payload ?? null,
    })
    .select('id, status')
    .maybeSingle()

  if (!insertError) {
    return { claimed: true, eventRowId: inserted?.id ?? null }
  }

  if (insertError.code !== '23505') {
    throw insertError
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('webhook_events')
    .select('id, status')
    .eq('provider', provider)
    .eq('dedupe_key', dedupeKey)
    .maybeSingle()

  if (fetchError) {
    throw fetchError
  }

  if (!existing) {
    return { claimed: false, duplicate: true }
  }

  if (existing.status === PROCESSED) {
    return { claimed: false, duplicate: true, eventRowId: existing.id }
  }

  if (existing.status === PROCESSING) {
    return { claimed: false, inFlight: true, eventRowId: existing.id }
  }

  const { data: reclaimed, error: reclaimError } = await supabaseAdmin
    .from('webhook_events')
    .update({
      status: PROCESSING,
      error_message: null,
      event_type: eventType ?? null,
      payload: payload ?? null,
    })
    .eq('id', existing.id)
    .eq('status', FAILED)
    .select('id')
    .maybeSingle()

  if (reclaimError) {
    throw reclaimError
  }

  if (!reclaimed) {
    return { claimed: false, duplicate: true, eventRowId: existing.id }
  }

  return { claimed: true, retry: true, eventRowId: reclaimed.id }
}

export async function completeWebhookEvent(supabaseAdmin, eventRowId) {
  if (!eventRowId) {
    return
  }

  const { error } = await supabaseAdmin
    .from('webhook_events')
    .update({
      status: PROCESSED,
      processed_at: new Date().toISOString(),
      error_message: null,
    })
    .eq('id', eventRowId)

  if (error) {
    throw error
  }
}

export async function failWebhookEvent(supabaseAdmin, eventRowId, errorMessage) {
  if (!eventRowId) {
    return
  }

  const { error } = await supabaseAdmin
    .from('webhook_events')
    .update({
      status: FAILED,
      error_message: String(errorMessage ?? '').slice(0, 2000),
    })
    .eq('id', eventRowId)

  if (error) {
    throw error
  }
}
