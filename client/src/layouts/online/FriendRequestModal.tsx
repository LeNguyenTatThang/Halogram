import React from 'react'
import type { Friend  } from '../../types/Friend'
import { useTranslation } from 'react-i18next'
interface FriendRequestModalProps {
    isOpen: boolean
    onClose: () => void
    requests: Friend[]
    onAcceptFriend: (friendId: string) => void
}

const FriendRequestModal: React.FC<FriendRequestModalProps> = ({
    isOpen,
    onClose,
    requests,
    onAcceptFriend,
}) => {
    const { t } = useTranslation('chat')

    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-2 max-h-[90vh] overflow-hidden dark:bg-gray-900">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold">{t('friend_requests')}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700 dark:hover:bg-opacity-50 transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="  evenodd"
                            />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-2 py-2">
                    {requests.length === 0 && (
                        <p className="text-center text-gray-500">{t('no_friend_requests')}</p>
                    )}

                    {requests.map(friend => (
                        <div
                            key={friend.id}
                            className="flex items-center justify-between mb-3 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={friend.friend.avatar || '/default-avatar.png'}
                                    alt={friend.friend.username}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="text-sm font-medium">
                                    {friend.friend.username}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onAcceptFriend(friend.id)}
                                    className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
                                >
                                    {t('accept')}
                                </button>
                                <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition dark:bg-gray-600 dark:hover:bg-gray-500">
                                    {t('delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FriendRequestModal