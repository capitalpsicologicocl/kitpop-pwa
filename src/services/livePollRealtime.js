import { supabase } from './supabaseClient'

function channelName(sessionId) {
  return `live_polls:${sessionId}`
}

/**
 * Suscripción Realtime para sesiones en vivo.
 * Facilitador: postgres_changes en votos, polls y sesión.
 * Participante: broadcast cuando el facilitador abre/cierra polls o cambia estado.
 */
export function subscribeLiveSessionRealtime(sessionId, handlers = {}) {
  const { onVoteInsert, onPollChange, onSessionChange, onBroadcast } = handlers

  if (!sessionId) {
    return () => {}
  }

  const channel = supabase
    .channel(channelName(sessionId), {
      config: { broadcast: { ack: false, self: false } },
    })
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'live_poll_votes',
        filter: `live_session_id=eq.${sessionId}`,
      },
      (payload) => {
        onVoteInsert?.(payload.new)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'live_polls',
        filter: `live_session_id=eq.${sessionId}`,
      },
      (payload) => {
        onPollChange?.(payload.new)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'live_sessions',
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        onSessionChange?.(payload.new)
      }
    )
    .on('broadcast', { event: 'live_state' }, ({ payload }) => {
      onBroadcast?.(payload)
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/** Notifica a participantes (anon) vía broadcast sin depender de RLS en tablas. */
export async function broadcastLiveSessionState(sessionId, payload) {
  if (!sessionId) {
    return
  }

  const channel = supabase.channel(channelName(sessionId), {
    config: { broadcast: { ack: false } },
  })

  await new Promise((resolve) => {
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        resolve()
      }
    })
  })

  await channel.send({
    type: 'broadcast',
    event: 'live_state',
    payload: { sessionId, ...payload },
  })

  supabase.removeChannel(channel)
}
