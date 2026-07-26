import React from 'react'
import type { Friend, FriendUser } from '../../types/Friend' 
import Logo from '../../assets/logo.png'
import VerifiedBadge from '../../components/common/VerifiedBadge'

interface FriendListProps {
    friends: Friend[]
    onOpenChat: (user: FriendUser) => void
    onlineUserIds: Set<string>
}

const FriendList: React.FC<FriendListProps> = ({ friends, onOpenChat, onlineUserIds }) => {
    return (
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
            {friends.map(friend => (
                <button
                    key={friend.id}
                    onClick={() =>
                        onOpenChat({
                            id: friend.friend.id,
                            username: friend.friend.username,
                            displayName: friend.friend.displayName,
                            avatar: friend.friend.avatar ?? Logo,
                        })
                    }
                    className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer"
                >
                    <div className="relative flex-shrink-0">
                        <img
                            src={friend.friend.avatar ?? Logo}
                            alt={friend.friend.username}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        {onlineUserIds.has(friend.friend.id) && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-black transition-opacity duration-200" />
                        )}
                    </div>
                    <div className="ml-3 min-w-0 flex-1 text-left">
                        <p className="text-sm font-semibold truncate inline-flex items-center gap-0.5">
                            {friend.friend.displayName}
                            {friend.friend.isVerified && <VerifiedBadge />}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            @{friend.friend.username}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    )
}

export default FriendList