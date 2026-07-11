import { supabase } from './supabaseClient'

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function updateProfile(userId, fullName) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: fullName,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
