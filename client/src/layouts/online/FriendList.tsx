import React from 'react'
import type { Friend, FriendUser } from '../../types/Friend' 
import Logo from '../../assets/logo.png'

interface FriendListProps {
    friends: Friend[]
    onOpenChat: (user: FriendUser) => void
}

const FriendList: React.FC<FriendListProps> = ({ friends, onOpenChat }) => {
    return (
        <div className="flex-1 overflow-y-auto px-2 py-2">
            <button
                onClick={() =>
                    onOpenChat({
                        id: 'all',
                        username: 'AI Halogram',
                        avatar: Logo,
                    })
                }
                className="flex items-center justify-between mb-3 w-full cursor-pointer hover:bg-gray-100 px-2 py-1 rounded dark:hover:bg-gray-700 dark:hover:bg-opacity-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <img
                        src={Logo}
                        alt="AI Halogram"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">AI Halogram</span>
                </div>
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
            </button>

            {friends.map(friend => (
                <button
                    key={friend.id}
                    onClick={() =>
                        onOpenChat({
                            id: friend.friend.id,
                            username: `${friend.friend.username}`,
                            avatar: friend.friend.avatar ?? Logo,
                        })
                    }
                    className="flex items-center justify-between mb-3 w-full cursor-pointer hover:bg-gray-100 px-2 py-1 rounded dark:hover:bg-gray-700 dark:hover:bg-opacity-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <img
                            src={friend.friend.avatar ?? Logo}
                            alt={friend.friend.username}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium">
                            {friend.friend.username}
                        </span>
                    </div>
                    <span className="h-3 w-3 rounded-full bg-green-500"></span>
                </button>
            ))}
        </div>
    )
}

export default FriendList