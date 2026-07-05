import { Check, Clock3, UserPlus } from 'lucide-react'
import type { SearchUser } from '../../../types/Search'

interface SearchUserItemProps {
    user: SearchUser
}

const SearchUserItem = ({ user }: SearchUserItemProps) => {
    return (
        <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-100">
            <div className="flex items-center gap-3">
                <img
                    src={user.avatar ?? '/default-avatar.png'}
                    alt={user.username}
                    className="h-10 w-10 rounded-full object-cover"
                />

                <div>
                    <p className="font-semibold">{user.displayName}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
            </div>

            {user.friendshipStatus === 'NONE' && (
                <button className="rounded-full p-2 hover:bg-blue-100">
                    <UserPlus size={20} className="text-blue-600" />
                </button>
            )}

            {user.friendshipStatus === 'PENDING' && (
                <Clock3 size={20} className="text-yellow-500" />
            )}

            {user.friendshipStatus === 'FRIENDS' && (
                <Check size={20} className="text-green-600" />
            )}
        </div>
    )
}

export default SearchUserItem
