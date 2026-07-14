export function getAuthSiteUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  return import.meta.env.VITE_APP_URL || 'https://app.kitpopapp.com'
}

export function getLoginUrl(query = '') {
  return `${getAuthSiteUrl()}/login${query ? `?${query}` : ''}`
}

export function getResetPasswordUrl() {
  return `${getAuthSiteUrl()}/restablecer-contrasena`
}
