import React, { useEffect, useState } from 'react'
import { X, Search, Check } from 'lucide-react'
import { listFriends } from '../../utils/friend'

interface Friend {
  id: string
  username: string
  avatar: string | null
}

interface TagFriendsModalProps {
  selectedIds: string[]
  onConfirm: (ids: string[]) => void
  onClose: () => void
}

const TagFriendsModal: React.FC<TagFriendsModalProps> = ({
  selectedIds,
  onConfirm,
  onClose,
}) => {
  const [friends, setFriends] = useState<Friend[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds))
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await listFriends()
        if (res.success) {
          setFriends(res.data.map((f: { friend: Friend }) => f.friend))
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchFriends()
  }, [])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = friends.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-sm mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Tag Friends</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search friends..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none flex-1"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No friends found</div>
          ) : (
            filtered.map((friend) => (
              <button
                key={friend.id}
                onClick={() => toggle(friend.id)}
                className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 transition-colors"
              >
                <img
                  src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.username}&background=random`}
                  alt={friend.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-sm font-medium flex-1 text-left">{friend.username}</span>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selected.has(friend.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  {selected.has(friend.id) && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={() => onConfirm(Array.from(selected))}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Done {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TagFriendsModal
