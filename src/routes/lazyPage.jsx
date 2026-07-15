import { lazy, Suspense } from 'react'

import RouteFallback from '../components/ui/RouteFallback'

export function lazyPage(importFn) {
  const LazyComponent = lazy(importFn)

  function LazyPage(props) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }

  return LazyPage
}
