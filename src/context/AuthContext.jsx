import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  addFavorite,
  fetchFavoriteSlugs,
  removeFavorite,
} from '../services/favoritesService'
import { fetchProfile, updateProfile, uploadAvatar } from '../services/profileService'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [favoriteSlugs, setFavoriteSlugs] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async (userId) => {
    try {
      const data = await fetchProfile(userId)
      setProfile(data)
    } catch {
      setProfile(null)
    }
  }, [])

  const refreshFavorites = useCallback(async (userId) => {
    try {
      const slugs = await fetchFavoriteSlugs(userId)
      setFavoriteSlugs(slugs)
    } catch {
      setFavoriteSlugs([])
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function initSession() {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user ?? null

      if (!mounted) {
        return
      }

      setUser(sessionUser)

      if (sessionUser) {
        await Promise.all([
          refreshProfile(sessionUser.id),
          refreshFavorites(sessionUser.id),
        ])
      } else {
        setProfile(null)
        setFavoriteSlugs([])
      }

      if (mounted) {
        setLoading(false)
      }
    }

    initSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user ?? null
        setUser(sessionUser)

        if (sessionUser) {
          await Promise.all([
            refreshProfile(sessionUser.id),
            refreshFavorites(sessionUser.id),
          ])
        } else {
          setProfile(null)
          setFavoriteSlugs([])
        }

        setLoading(false)
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [refreshFavorites, refreshProfile])

  const signIn = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
  }, [])

  const signUp = useCallback(async ({ email, password, fullName }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  }, [])

  const saveProfile = useCallback(async (fullName) => {
    if (!user) {
      throw new Error('Debes iniciar sesión para actualizar tu perfil.')
    }

    const data = await updateProfile(user.id, fullName)
    setProfile(data)
    return data
  }, [user])

  const saveAvatar = useCallback(async (file) => {
    if (!user) {
      throw new Error('Debes iniciar sesión para actualizar tu foto.')
    }

    const data = await uploadAvatar(user.id, file)
    setProfile(data)
    return data
  }, [user])

  const toggleFavorite = useCallback(async (activitySlug) => {
    if (!user) {
      throw new Error('LOGIN_REQUIRED')
    }

    const isFavorite = favoriteSlugs.includes(activitySlug)

    if (isFavorite) {
      await removeFavorite(user.id, activitySlug)
      setFavoriteSlugs((current) =>
        current.filter((slug) => slug !== activitySlug)
      )
      return false
    }

    await addFavorite(user.id, activitySlug)
    setFavoriteSlugs((current) => [activitySlug, ...current])
    return true
  }, [favoriteSlugs, user])

  const value = useMemo(
    () => ({
      user,
      profile,
      favoriteSlugs,
      loading,
      signIn,
      signUp,
      signOut,
      saveProfile,
      saveAvatar,
      refreshFavorites,
      refreshProfile,
      toggleFavorite,
      isAuthenticated: Boolean(user),
    }),
    [
      user,
      profile,
      favoriteSlugs,
      loading,
      signIn,
      signUp,
      signOut,
      saveProfile,
      saveAvatar,
      refreshFavorites,
      refreshProfile,
      toggleFavorite,
    ]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
