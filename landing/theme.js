/**
 * KitPOP landing — tema claro/oscuro (misma clave que la app).
 */
(function initKitpopLandingTheme() {
  var STORAGE_KEY = 'kitpop-theme'

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function resolveTheme(preference) {
    if (preference === 'system') {
      return getSystemTheme()
    }

    return preference
  }

  function applyTheme(preference) {
    var resolved = resolveTheme(preference)
    var root = document.documentElement

    root.dataset.theme = resolved
    root.classList.toggle('theme-dark', resolved === 'dark')
    root.classList.toggle('theme-light', resolved === 'light')
    localStorage.setItem(STORAGE_KEY, preference)

    var toggle = document.getElementById('theme-toggle')
    if (toggle) {
      toggle.setAttribute(
        'aria-label',
        resolved === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'
      )
      toggle.innerHTML =
        resolved === 'dark'
          ? '<svg class="kp-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><path stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/></svg>'
          : '<svg class="kp-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M14.8 4.2a7.8 7.8 0 1 0 5 5 6.5 6.5 0 0 1-5-5Z"/></svg>'
    }
  }

  var preference = localStorage.getItem(STORAGE_KEY) || 'system'
  applyTheme(preference)

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('theme-toggle')
    if (!toggle) {
      return
    }

    toggle.addEventListener('click', function () {
      var current = resolveTheme(localStorage.getItem(STORAGE_KEY) || 'system')
      applyTheme(current === 'dark' ? 'light' : 'dark')
    })
  })

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if ((localStorage.getItem(STORAGE_KEY) || 'system') === 'system') {
      applyTheme('system')
    }
  })
})()
