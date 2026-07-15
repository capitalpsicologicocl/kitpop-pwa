import { useEffect, useState } from 'react'

import { loadActivityContent, loadCategoryContent, loadAllActivityContent } from '../data/contentLoader'

export function useCategoryActivities(categorySlug) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    loadCategoryContent(categorySlug)
      .then((items) => {
        if (mounted) {
          setActivities(items)
        }
      })
      .catch((cause) => {
        if (mounted) {
          setError(cause)
          setActivities([])
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [categorySlug])

  return { activities, loading, error }
}

export function useActivity(activitySlug) {
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    loadActivityContent(activitySlug)
      .then((item) => {
        if (mounted) {
          setActivity(item)
        }
      })
      .catch((cause) => {
        if (mounted) {
          setError(cause)
          setActivity(null)
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [activitySlug])

  return { activity, loading, error }
}

export function useAllActivities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    loadAllActivityContent()
      .then((items) => {
        if (mounted) {
          setActivities(items)
        }
      })
      .catch((cause) => {
        if (mounted) {
          setError(cause)
          setActivities([])
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return { activities, loading, error }
}

export function useActivityIndex() {
  const [index, setIndex] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    import('../data/contentLoader')
      .then(({ loadActivityIndex }) => loadActivityIndex())
      .then((items) => {
        if (mounted) {
          setIndex(items)
        }
      })
      .catch((cause) => {
        if (mounted) {
          setError(cause)
          setIndex([])
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return { index, loading, error }
}
