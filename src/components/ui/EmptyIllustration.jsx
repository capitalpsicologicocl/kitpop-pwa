const VARIANTS = {
  favorites: (
    <>
      <path d="M60 92c-18-12-28-22-28-36a16 16 0 0 1 28-10 16 16 0 0 1 28 10c0 14-10 24-28 36Z" fill="currentColor" opacity="0.22" />
      <path d="M60 88c-14-9-22-17-22-28a12 12 0 0 1 22-8 12 12 0 0 1 22 8c0 11-8 19-22 28Z" fill="currentColor" />
      <circle cx="92" cy="34" r="6" fill="currentColor" opacity="0.35" />
    </>
  ),
  search: (
    <>
      <circle cx="52" cy="52" r="22" fill="none" stroke="currentColor" strokeWidth="6" />
      <path d="M68 68 88 88" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <circle cx="92" cy="30" r="5" fill="currentColor" opacity="0.35" />
    </>
  ),
  journal: (
    <>
      <rect x="28" y="24" width="64" height="72" rx="10" fill="currentColor" opacity="0.18" />
      <rect x="34" y="30" width="52" height="60" rx="8" fill="currentColor" />
      <path d="M42 44h36M42 56h28M42 68h32" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
    </>
  ),
  workshops: (
    <>
      <rect x="24" y="30" width="72" height="54" rx="10" fill="currentColor" opacity="0.18" />
      <rect x="30" y="36" width="60" height="42" rx="8" fill="currentColor" />
      <path d="M38 48h44M38 58h32M38 68h24" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
      <circle cx="88" cy="28" r="8" fill="currentColor" opacity="0.45" />
    </>
  ),
  surveys: (
    <>
      <rect x="30" y="28" width="60" height="68" rx="12" fill="currentColor" />
      <circle cx="46" cy="48" r="5" fill="#fff" opacity="0.9" />
      <circle cx="46" cy="64" r="5" fill="#fff" opacity="0.9" />
      <path d="M58 46h26M58 62h20" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
    </>
  ),
  live: (
    <>
      <circle cx="60" cy="60" r="28" fill="currentColor" opacity="0.18" />
      <circle cx="60" cy="60" r="18" fill="currentColor" />
      <circle cx="60" cy="60" r="6" fill="#fff" />
      <path d="M88 36h10M92 32v8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    </>
  ),
  list: (
    <>
      <rect x="28" y="30" width="64" height="12" rx="6" fill="currentColor" />
      <rect x="28" y="50" width="48" height="12" rx="6" fill="currentColor" opacity="0.7" />
      <rect x="28" y="70" width="56" height="12" rx="6" fill="currentColor" opacity="0.45" />
      <circle cx="92" cy="36" r="8" fill="currentColor" opacity="0.25" />
    </>
  ),
  default: (
    <>
      <circle cx="60" cy="60" r="30" fill="currentColor" opacity="0.15" />
      <path d="M44 62c6-10 16-16 16-16s10 6 16 16" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <circle cx="48" cy="50" r="4" fill="currentColor" />
      <circle cx="72" cy="50" r="4" fill="currentColor" />
    </>
  ),
}

export default function EmptyIllustration({ variant = 'default', className = '' }) {
  return (
    <svg
      className={`empty-illustration ${className}`.trim()}
      viewBox="0 0 120 120"
      role="img"
      aria-hidden="true"
    >
      {VARIANTS[variant] ?? VARIANTS.default}
    </svg>
  )
}
