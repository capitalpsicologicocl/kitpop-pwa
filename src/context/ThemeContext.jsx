import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const THEME_STORAGE_KEY = 'kitpop-theme'

const ThemeContext = createContext(null)

function getSystemTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(preference) {
  if (preference === 'system') {
    return getSystemTheme()
  }

  return preference
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => {
    if (typeof window === 'undefined') {
      return 'system'
    }

    return localStorage.getItem(THEME_STORAGE_KEY) || 'system'
  })

  const resolved = useMemo(() => resolveTheme(preference), [preference])

  useEffect(() => {
    const root = document.documentElement

    root.dataset.theme = resolved
    root.classList.toggle('theme-dark', resolved === 'dark')
    root.classList.toggle('theme-light', resolved === 'light')
    localStorage.setItem(THEME_STORAGE_KEY, preference)
  }, [preference, resolved])

  useEffect(() => {
    if (preference !== 'system') {
      return undefined
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')

    function handleChange() {
      const next = media.matches ? 'dark' : 'light'
      const root = document.documentElement
      root.dataset.theme = next
      root.classList.toggle('theme-dark', next === 'dark')
      root.classList.toggle('theme-light', next === 'light')
    }

    media.addEventListener('change', handleChange)

    return () => {
      media.removeEventListener('change', handleChange)
    }
  }, [preference])

  const value = useMemo(
    () => ({
      preference,
      resolved,
      setPreference,
      toggleTheme() {
        setPreference((current) => {
          const active = resolveTheme(current)
          return active === 'dark' ? 'light' : 'dark'
        })
      },
    }),
    [preference, resolved],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}

export { THEME_STORAGE_KEY, resolveTheme }
