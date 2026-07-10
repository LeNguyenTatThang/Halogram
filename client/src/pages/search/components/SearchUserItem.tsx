import { Check, Clock3, UserPlus } from 'lucide-react'
import type { SearchUser } from '../../../types/Search'
import Logo from '../../../assets/logo.png'

interface SearchUserItemProps {
    user: SearchUser

    onSendRequest?: (userId: string) => void
    onCancelRequest?: (userId: string) => void
    onRemoveFriend?: (userId: string) => void

    loading?: boolean
}

const SearchUserItem = ({ user, onSendRequest, onCancelRequest, onRemoveFriend, loading }: SearchUserItemProps) => {
    return (
        <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-100">
            <div className="flex items-center gap-3">
                <img
                    src={user.avatar ?? Logo}
                    alt={user.username}
                    className="h-10 w-10 rounded-full object-cover"
                />

                <div>
                    <p className="font-semibold">{user.displayName}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
            </div>

            {user.friendshipStatus === 'NONE' && (
                <button
                    className="rounded-full p-2 hover:bg-blue-100"
                    onClick={() => onSendRequest?.(user.id)}
                    disabled={loading}
                >
                    <UserPlus size={20} className="text-blue-600" />
                </button>
            )}

            {user.friendshipStatus === 'PENDING' && (
                <button
                    className="rounded-full p-2 hover:bg-yellow-100"
                    onClick={() => onCancelRequest?.(user.id)}
                    disabled={loading}
                >
                    <Clock3 size={20} className="text-yellow-500" />
                </button>
            )}

            {user.friendshipStatus === 'FRIENDS' && (
                <button
                    className="rounded-full p-2 hover:bg-green-100" onClick={() => onRemoveFriend?.(user.id)}
                    disabled={loading}
                >
                    <Check size={20} className="text-green-600" />
                </button>
            )}
        </div>
    )
}

export default SearchUserItem
