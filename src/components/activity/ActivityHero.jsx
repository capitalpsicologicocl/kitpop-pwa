import HtmlContent from './HtmlContent'

export default function ActivityHero({ kitpop, isFavorite, onToggleFavorite }) {
  return (
    <article className="activity-hero">
      <div className="activity-top">
        <span className="activity-kicker">
          {kitpop.cat || 'Actividad KitPOP'}
        </span>

        <button
          type="button"
          className={`fav-btn ${isFavorite ? 'on' : ''}`}
          onClick={onToggleFavorite}
        >
          {isFavorite ? '★ Favorita' : '☆ Agregar a favoritos'}
        </button>
      </div>

      <HtmlContent as="h1" html={kitpop.name} />

      <HtmlContent as="p" className="activity-lead" html={kitpop.sub} />

      {(kitpop.metas?.length ?? 0) > 0 && (
        <div className="meta-grid">
          {kitpop.metas.map((meta) => (
            <span key={meta} className="meta-chip">
              {meta}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
