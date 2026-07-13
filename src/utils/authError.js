export function formatAuthError(error, fallback = 'No se pudo completar la operación.') {
  if (!error) {
    return fallback
  }

  if (typeof error === 'string') {
    return error || fallback
  }

  const message =
    error.message ||
    error.msg ||
    error.error_description ||
    error.error ||
    error.code

  if (message && String(message).trim() && String(message) !== '{}') {
    return String(message)
  }

  return fallback
}
