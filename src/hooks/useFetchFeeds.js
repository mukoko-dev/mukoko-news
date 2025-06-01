import { useState, useEffect, useCallback } from 'react'

export function useFetchFeeds() {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFeeds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/feeds')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch feeds: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format')
      }
      
      setFeeds(data)
    } catch (err) {
      console.error('Error fetching feeds:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    fetchFeeds()
  }, [fetchFeeds])

  useEffect(() => {
    fetchFeeds()
  }, [fetchFeeds])

  return { feeds, loading, error, refetch }
}
