export function Skeleton({ className = '', style }) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      aria-hidden="true"
      style={style}
    />
  )
}

export function SkeletonText({ width = '100%', className = '' }) {
  return <Skeleton className={`skeleton-text ${className}`.trim()} style={{ width }} />
}

export function ListPageSkeleton({ rows = 4, showForm = true }) {
  return (
    <div className="list-page-skeleton" aria-busy="true" aria-label="Cargando contenido">
      <SkeletonText width="40%" className="skeleton-title" />
      <SkeletonText width="70%" className="skeleton-subtitle" />

      {showForm && (
        <div className="skeleton-panel">
          <SkeletonText width="30%" />
          <SkeletonText width="100%" />
          <SkeletonText width="85%" />
          <Skeleton className="skeleton-button" />
        </div>
      )}

      <div className="skeleton-list">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="skeleton-list-row">
            <SkeletonText width="55%" />
            <SkeletonText width="35%" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CategoryGridSkeleton({ count = 6 }) {
  return (
    <div className="category-grid-skeleton cats-grid" aria-busy="true" aria-label="Cargando categorías">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-category-card">
          <Skeleton className="skeleton-category-icon" />
          <SkeletonText width="70%" />
          <SkeletonText width="90%" />
        </div>
      ))}
    </div>
  )
}
