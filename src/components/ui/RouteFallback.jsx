export default function RouteFallback() {
  return (
    <main className="fade-in">
      <p className="auth-loading" role="status" aria-live="polite">
        Cargando…
      </p>
    </main>
  )
}
