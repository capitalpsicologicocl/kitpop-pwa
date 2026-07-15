import {
  formatMediaDuration,
  getActivityMediaItems,
  getVimeoEmbedUrl,
  getYoutubeEmbedUrl,
  normalizeMediaProvider,
} from '../../utils/activityMedia'

function MediaPlayer({ item }) {
  const provider = normalizeMediaProvider(item)
  const title = item.title || 'Recurso'

  if (provider === 'youtube') {
    const embedUrl = getYoutubeEmbedUrl(item.url)

    if (!embedUrl) {
      return null
    }

    return (
      <div className="activity-media-embed">
        <iframe
          title={title}
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (provider === 'vimeo') {
    const embedUrl = getVimeoEmbedUrl(item.url)

    if (!embedUrl) {
      return null
    }

    return (
      <div className="activity-media-embed">
        <iframe title={title} src={embedUrl} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      </div>
    )
  }

  if (provider === 'audio' || item.type === 'audio') {
    return (
      <audio className="activity-media-audio" controls preload="none" src={item.url}>
        Tu navegador no reproduce audio embebido.
      </audio>
    )
  }

  return (
    <a href={item.url} className="activity-media-link" target="_blank" rel="noreferrer">
      Abrir recurso ↗
    </a>
  )
}

function mediaTypeLabel(item) {
  const provider = normalizeMediaProvider(item)

  if (provider === 'youtube' || provider === 'vimeo') {
    return 'Video'
  }

  if (provider === 'audio' || item.type === 'audio') {
    return 'Audio'
  }

  return 'Enlace'
}

export default function ActivityMedia({ kitpop }) {
  const items = getActivityMediaItems(kitpop)

  return (
    <div className="activity-pane">
      <div className="content-card">
        <h3>Recursos y microlearning</h3>
        <p className="activity-media-intro">
          Audios, videos y material complementario para profundizar antes o después de facilitar.
        </p>

        <div className="activity-media-list">
          {items.map((item, index) => {
            const duration = formatMediaDuration(item.durationSec)

            return (
              <article key={`${item.url}-${index}`} className="activity-media-card">
                <div className="activity-media-card-head">
                  <span className="activity-media-type">{mediaTypeLabel(item)}</span>
                  {duration && <span className="activity-media-duration">{duration}</span>}
                </div>
                <h4>{item.title || 'Recurso'}</h4>
                {item.description && <p>{item.description}</p>}
                <MediaPlayer item={item} />
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
