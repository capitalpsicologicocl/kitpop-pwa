const YOUTUBE_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/

export function normalizeMediaProvider(item) {
  if (item.provider) {
    return item.provider
  }

  const url = String(item.url ?? '')

  if (YOUTUBE_PATTERN.test(url)) {
    return 'youtube'
  }

  if (VIMEO_PATTERN.test(url)) {
    return 'vimeo'
  }

  if (item.type === 'audio') {
    return 'audio'
  }

  if (item.type === 'video') {
    return 'video'
  }

  return 'link'
}

export function getYoutubeEmbedUrl(url) {
  const match = String(url ?? '').match(YOUTUBE_PATTERN)
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null
}

export function getVimeoEmbedUrl(url) {
  const match = String(url ?? '').match(VIMEO_PATTERN)
  return match ? `https://player.vimeo.com/video/${match[1]}` : null
}

export function formatMediaDuration(seconds) {
  const total = Number(seconds)

  if (!Number.isFinite(total) || total <= 0) {
    return ''
  }

  const minutes = Math.floor(total / 60)
  const remainder = total % 60

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours} h ${mins} min`
  }

  return remainder ? `${minutes} min ${remainder} s` : `${minutes} min`
}

export function getActivityMediaItems(kitpop) {
  return Array.isArray(kitpop?.media) ? kitpop.media.filter((item) => item?.url) : []
}
