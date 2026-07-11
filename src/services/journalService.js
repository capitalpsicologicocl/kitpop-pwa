import { supabase } from './supabaseClient'

export async function fetchJournalEntries(userId) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createJournalEntry(userId, entry) {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      activity_slug: entry.activitySlug || null,
      entry_date: entry.entryDate || null,
      organization: entry.organization || null,
      participants_count: entry.participantsCount || null,
      duration_real: entry.durationReal || null,
      notes: entry.notes || null,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteJournalEntry(userId, entryId) {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('user_id', userId)
    .eq('id', entryId)

  if (error) {
    throw error
  }
}
