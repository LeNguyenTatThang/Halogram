import React from 'react'
import type { FriendRequest, User } from './mockData'
import { defaultAvatarUrl } from './mockData'

interface FriendListProps {
    friends: FriendRequest[]
    onOpenChat: (user: User) => void
}

const FriendList: React.FC<FriendListProps> = ({ friends, onOpenChat }) => {
    return (
        <div className="flex-1 overflow-y-auto px-4 py-2">
            <button
                onClick={() =>
                    onOpenChat({
                        id: 0,
                        name: 'Tất cả bạn bè',
                        online: true,
                        image: defaultAvatarUrl,
                    })
                }
                className="flex items-center justify-between mb-3 w-full cursor-pointer hover:bg-gray-100 px-2 py-1 rounded dark:hover:bg-gray-700 dark:hover:bg-opacity-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <img
                        src={defaultAvatarUrl}
                        alt="Tất cả bạn bè"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">Tất cả bạn bè</span>
                </div>
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
            </button>

            {friends.map(friend => (
                <button
                    key={friend.id}
                    onClick={() =>
                        onOpenChat({
                            id: friend.friend_info.id,
                            name: `${friend.friend_info.first_name} ${friend.friend_info.last_name}`,
                            online: true,
                            image: friend.friend_info.avatar ?? defaultAvatarUrl,
                        })
                    }
                    className="flex items-center justify-between mb-3 w-full cursor-pointer hover:bg-gray-100 px-2 py-1 rounded dark:hover:bg-gray-700 dark:hover:bg-opacity-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <img
                            src={friend.friend_info.avatar ?? defaultAvatarUrl}
                            alt={friend.friend_info.username}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium">
                            {friend.friend_info.first_name} {friend.friend_info.last_name}
                        </span>
                    </div>
                    <span className="h-3 w-3 rounded-full bg-green-500"></span>
                </button>
            ))}
        </div>
    )
}

export default FriendList
