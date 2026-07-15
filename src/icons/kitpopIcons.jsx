/** KitPOP icon set — SVG propios, estilo marca morada (no emojis de teclado). */

export const KITPOP_ICONS = {
  // Categorías
  facilitate: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        fill="currentColor"
        d="M12 6.5v5.2l3.2 1.8-.8 1.4-3.8-2.1V6.5h1.4Z"
      />
    </>
  ),
  'perma-star': (
    <>
      <path
        fill="currentColor"
        d="M12 3.2 13.8 8l5.2.4-4 3.4 1.2 5.1L12 14.8 7 16.9l1.2-5.1-4-3.4 5.2-.4L12 3.2Z"
      />
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
    </>
  ),
  team: (
    <>
      <circle cx="8.5" cy="9" r="2.6" fill="currentColor" />
      <circle cx="15.5" cy="9" r="2.6" fill="currentColor" />
      <path
        fill="currentColor"
        d="M4.5 18.5c.6-2.4 2.4-3.8 4-3.8s3.4 1.4 4 3.8M11.5 18.5c.6-2.4 2.4-3.8 4-3.8s3.4 1.4 4 3.8"
        opacity="0.85"
      />
    </>
  ),
  meeting: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" d="M4 9.5h16M9 5V4M15 5V4" />
      <circle cx="9" cy="13" r="1.2" fill="currentColor" />
      <circle cx="12" cy="13" r="1.2" fill="currentColor" />
      <circle cx="15" cy="13" r="1.2" fill="currentColor" />
    </>
  ),
  connection: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4"
      />
      <path
        fill="currentColor"
        d="M7.2 14.8c-1.5.8-2.4 1.8-2.4 2.7 0 1.5 2.5 2.7 5.6 2.7h.8"
        opacity="0.75"
      />
      <path
        fill="currentColor"
        d="M16.8 14.8c1.5.8 2.4 1.8 2.4 2.7 0 1.5-2.5 2.7-5.6 2.7h-.8"
        opacity="0.75"
      />
    </>
  ),
  sessions: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" d="M8 3v3M16 3v3M5 10h14" />
      <rect x="8" y="12.5" width="3" height="3" rx=".8" fill="currentColor" />
      <rect x="13" y="12.5" width="3" height="3" rx=".8" fill="currentColor" opacity="0.55" />
    </>
  ),
  conversation: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        d="M5 7.5h9a2 2 0 0 1 2 2v4.5H9.5L5 17V9.5a2 2 0 0 1 0-2Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        d="M11 11.5h8a2 2 0 0 1 2 2V18l-3.5-2H13"
        opacity="0.65"
      />
    </>
  ),
  strength: (
    <>
      <path
        fill="currentColor"
        d="M12 4.5 13.4 8.8l4.6.4-3.5 3 1.1 4.5L12 14.3 8.4 16.7l1.1-4.5-3.5-3 4.6-.4L12 4.5Z"
      />
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.3" />
    </>
  ),
  mindful: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        fill="currentColor"
        d="M12 6.5c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5Zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z"
        opacity="0.85"
      />
    </>
  ),
  mind: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        d="M8.5 8.5c0-2 1.6-3.5 3.5-3.5s3.5 1.5 3.5 3.5c1.8.3 3 1.8 3 3.7 0 2.2-1.8 4-4 4h-5c-2.2 0-4-1.8-4-4 0-1.9 1.2-3.4 3-3.7Z"
      />
      <circle cx="10" cy="11.5" r=".9" fill="currentColor" />
      <circle cx="14" cy="11.5" r=".9" fill="currentColor" />
      <path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" d="M10.5 14.2c.8.6 1.7.9 2.5.9s1.7-.3 2.5-.9" />
    </>
  ),

  // Hub / navegación app
  workshop: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" d="M8 9h8M8 12.5h5.5M8 16h3" strokeLinecap="round" />
    </>
  ),
  'live-bolt': (
    <>
      <path fill="currentColor" d="M13.2 3 7 13.2h4.2L10.8 21 17 10.8H12.8L13.2 3Z" />
    </>
  ),
  'star-outline': (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      d="M12 4.8 13.6 9l4.7.4-3.6 3.1 1.1 4.6L12 14.6 8.2 16.9l1.1-4.6-3.6-3.1 4.7-.4L12 4.8Z"
    />
  ),
  journal: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        d="M7 4.5h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"
      />
      <path stroke="currentColor" strokeWidth="1.6" d="M9 4.5v17M12 8h5M12 11.5h4M12 15h4" strokeLinecap="round" />
    </>
  ),
  survey: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5" />
      <circle cx="8" cy="8.5" r="1" fill="currentColor" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <circle cx="8" cy="15.5" r="1" fill="currentColor" />
    </>
  ),
  broadcast: (
    <>
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M6.5 8.2a7 7 0 0 0 0 7.6M17.5 8.2a7 7 0 0 1 0 7.6M4 5.5a11 11 0 0 0 0 13M20 5.5a11 11 0 0 1 0 13"
      />
    </>
  ),

  // Landing / features
  'activities-bank': (
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
      <path stroke="currentColor" strokeWidth="1.6" d="M12 3.5V6M12 18v2.5M3.5 12H6M18 12h2.5" strokeLinecap="round" />
    </>
  ),
  clipboard: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        d="M9 5.5h6a1.5 1.5 0 0 1 1.5 1.5V19a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2V7a1.5 1.5 0 0 1 1.5-1.5Z"
      />
      <rect x="9.5" y="3.5" width="5" height="3.5" rx="1" fill="currentColor" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M9 11h6M9 14.5h4" />
    </>
  ),
  'ai-spark': (
    <>
      <path fill="currentColor" d="M12 2.5 13.2 8.2 19 9.4l-4.6 3.9 1.4 5.7L12 15.8 8.2 19l1.4-5.7L5 9.4l5.8-1.2L12 2.5Z" />
      <circle cx="18.5" cy="5" r="1.2" fill="currentColor" opacity="0.55" />
      <circle cx="5" cy="18" r="1" fill="currentColor" opacity="0.45" />
    </>
  ),
  export: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        d="M8 4.5h8v14H8a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2Z"
      />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M10 8.5h4M10 11.5h4M10 14.5h2.5" />
      <path fill="currentColor" d="M14.5 14.5 12 17l-2.5-2.5h1.8v-4h1.4v4h1.8Z" />
    </>
  ),
  cards: (
    <>
      <rect x="4" y="7" width="11" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9" y="4" width="11" height="13" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="9" y="4" width="11" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  briefcase: (
    <>
      <rect x="4" y="8" width="16" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M4 12h16" />
    </>
  ),
  'star-burst': (
    <>
      <path fill="currentColor" d="M12 2.8 14 9l6.2 1-4.7 4 1.4 6.1L12 16.8 7.1 20.2l1.4-6.1-4.7-4L10 9l2-6.2Z" />
    </>
  ),
  book: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        d="M6 5.5h11a1.5 1.5 0 0 1 1.5 1.5V19l-3.2-1.8L12 19l-3.3-1.8L5.5 19V7a1.5 1.5 0 0 1 1.5-1.5Z"
      />
      <path stroke="currentColor" strokeWidth="1.6" d="M12 5.5V19" />
    </>
  ),
  refresh: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M18 8.5A6.5 6.5 0 0 0 7.8 6.5M6 15.5A6.5 6.5 0 0 0 16.2 17.5"
      />
      <path fill="currentColor" d="M18 4.5v4h-4M6 19.5v-4h4" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M12 9v4.5l3 1.8M9.5 3.5h5" />
    </>
  ),
  device: (
    <>
      <rect x="7" y="3.5" width="10" height="17" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="17.5" r="1" fill="currentColor" />
      <rect x="9.5" y="6" width="5" height="8" rx=".8" fill="currentColor" opacity="0.2" />
    </>
  ),
  calm: (
    <>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M4 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"
      />
      <circle cx="12" cy="9" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        d="M3.8 12h16.4M12 3.5c2.5 2.8 4 6 4 8.5s-1.5 5.7-4 8.5c-2.5-2.8-4-6-4-8.5s1.5-5.7 4-8.5Z"
      />
    </>
  ),
  menu: (
    <>
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M5 7h14M5 12h14M5 17h14" />
    </>
  ),
  'sun': (
    <>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
    </>
  ),
  moon: (
    <path
      fill="currentColor"
      d="M14.8 4.2a7.8 7.8 0 1 0 5 5 6.5 6.5 0 0 1-5-5Z"
    />
  ),
  check: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.5 12.5 9.5 16.5 18.5 7.5"
    />
  ),
}

export const CATEGORY_ICON_MAP = {
  facilitacion: 'facilitate',
  perma: 'perma-star',
  equipo: 'team',
  reunion: 'meeting',
  conexion: 'connection',
  reuniones: 'sessions',
  conversaciones: 'conversation',
  fortalezas: 'strength',
  mindfulness: 'mindful',
  pnl: 'mind',
}

export default function KitpopIcon({
  name,
  size = 24,
  className = '',
  label,
  ...props
}) {
  const content = KITPOP_ICONS[name]

  if (!content) {
    return null
  }

  return (
    <svg
      className={`kp-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      {...props}
    >
      {content}
    </svg>
  )
}
