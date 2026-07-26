import { useNavigate } from 'react-router-dom'
import { Check, Clock3, UserPlus } from 'lucide-react'
import type { SearchUser } from '../../../types/Search'
import Logo from '../../../assets/logo.png'
import VerifiedBadge from '../../../components/common/VerifiedBadge'
import UserAvatar from '../../../components/ui/UserAvatar'

interface SearchUserItemProps {
    user: SearchUser

    onSendRequest?: (userId: string) => void
    onCancelRequest?: (userId: string) => void
    onRemoveFriend?: (userId: string) => void

    loading?: boolean
}

const SearchUserItem = ({ user, onSendRequest, onCancelRequest, onRemoveFriend, loading }: SearchUserItemProps) => {
    const navigate = useNavigate()

    return (
        <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-100">
            <button
                onClick={() => navigate(`/profile/${user.username}`)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
            >
                <UserAvatar src={user.avatar} name={user.displayName || user.username} size={40} className="flex-shrink-0" />

                <div className="min-w-0">
                    <p className="font-semibold truncate inline-flex items-center gap-0.5">{user.displayName}{user.isVerified && <VerifiedBadge />}</p>
                    <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                </div>
            </button>

            {user.friendshipStatus === 'NONE' && (
                <button
                    className="rounded-full p-2 hover:bg-blue-100 flex-shrink-0 ml-2"
                    onClick={() => onSendRequest?.(user.id)}
                    disabled={loading}
                >
                    <UserPlus size={20} className="text-blue-600" />
                </button>
            )}

            {user.friendshipStatus === 'PENDING' && (
                <button
                    className="rounded-full p-2 hover:bg-yellow-100 flex-shrink-0 ml-2"
                    onClick={() => onCancelRequest?.(user.id)}
                    disabled={loading}
                >
                    <Clock3 size={20} className="text-yellow-500" />
                </button>
            )}

            {user.friendshipStatus === 'FRIENDS' && (
                <button
                    className="rounded-full p-2 hover:bg-green-100 flex-shrink-0 ml-2"
                    onClick={() => onRemoveFriend?.(user.id)}
                    disabled={loading}
                >
                    <Check size={20} className="text-green-600" />
                </button>
            )}
        </div>
    )
}

export default SearchUserItem
