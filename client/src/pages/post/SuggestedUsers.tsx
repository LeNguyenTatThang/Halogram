import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import configAxios from '../../api/axios'
import { followUser } from '../../utils/follow'

interface SuggestedUser {
  id: string
  username: string
  displayName: string
  avatar: string | null
}

const SuggestedUsers = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true)
        setError(false)
        const res = await configAxios.get('/users/suggestions')
        setUsers(res.data.data ?? [])
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchSuggestions()
  }, [])

  const handleFollow = async (userId: string) => {
    setFollowingIds((prev) => new Set(prev).add(userId))
    try {
      await followUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch {
      setFollowingIds((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  return (
    <aside className="sticky top-8 w-80">
      {user && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
              className="h-14 w-14 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold">{user.username}</p>
              <p className="text-sm text-gray-500">{user.displayName}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">
          Suggested for you
        </span>
      </div>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gray-200" />
                <div className="space-y-1.5">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                  <div className="h-2.5 w-28 rounded bg-gray-100" />
                </div>
              </div>
              <div className="h-4 w-14 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500">Failed to load suggestions</p>
      )}

      {!loading && !error && users.length === 0 && (
        <p className="text-sm text-gray-500">No suggestions available</p>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="space-y-4">
          {users.map((suggested) => (
            <div
              key={suggested.id}
              className="flex items-center justify-between"
            >
              <button
                onClick={() => navigate(`/profile/${suggested.username}`)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <img
                  src={suggested.avatar || `https://ui-avatars.com/api/?name=${suggested.username}&background=random`}
                  className="h-11 w-11 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {suggested.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {suggested.displayName}
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleFollow(suggested.id)}
                disabled={followingIds.has(suggested.id)}
                className="text-xs font-semibold text-blue-500 hover:text-blue-700 disabled:text-gray-300 flex-shrink-0 ml-2"
              >
                {followingIds.has(suggested.id) ? '...' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}

export default SuggestedUsers
