import { acceptFriend, listFriendRequests, listFriends } from '../utils/friend'
import React, { useEffect, useState } from 'react'
import { X, Users } from 'lucide-react'
import FriendRequestModal from './online/FriendRequestModal'
import FriendList from './online/FriendList'
import ChatWindow from './online/ChatWindow'
import type {Friend, FriendUser} from '../types/Friend'
import { useTranslation } from 'react-i18next'
import { socket } from '../lib/socket'
import { useChat } from '../context/ChatContext'

const Online: React.FC = () => {
    const { t } = useTranslation('chat')
    const [isOpen, setIsOpen] = useState<boolean>(true)
    const { openChats, openChat, closeChat } = useChat()
    const [friends, setFriends] = useState<Friend[]>([])
    const [friendRequests, setFriendRequests] = useState<Friend[]>([])
    const [isOpenModel, setIsOpenModel] = useState<boolean>(false)
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set())

    const handleOpenChat = (user: FriendUser) => {
        openChat(user)
    }

    const handleCloseChat = (userId: string) => {
        const popup = openChats.find(c => c.user.id === userId)
        if (popup) {
            closeChat(popup.conversationId)
        }
    }

    const getListFriends = async () => {
        try {
            const res = await listFriends()
            setFriends(res)

        } catch (err) {
            console.log(err)
        }
    }

    const fetchFriendRequests = async () => {
        try {
            const res = await listFriendRequests()
            setFriendRequests(res)
        } catch (err) {
            console.error(err)
        }
    }
    
    const handleAcceptFriend = async (friendId: string) => {
        try {
            await acceptFriend(friendId)
            setFriendRequests(prev => prev.filter(fr => fr.id !== friendId))
            getListFriends()
        } catch (err) {
            console.log(err)
        }
    }

    const handleOpenFriendRequests = async () => {
        setIsOpenModel(true)
        await fetchFriendRequests()
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                const [friends, requests] = await Promise.all([
                    listFriends(),
                    listFriendRequests(),
                ])

                setFriends(friends)
                setFriendRequests(requests)
            } catch (err) {
                console.error(err)
            }
        }

        loadData()
    }, [])

    useEffect(() => {
        const handleOnlineUsers = (data: { userIds: string[] }) => {
            setOnlineUserIds(new Set(data.userIds))
        }

        const handleUserOnline = (data: { userId: string }) => {
            setOnlineUserIds(prev => new Set(prev).add(data.userId))
        }

        const handleUserOffline = (data: { userId: string }) => {
            setOnlineUserIds(prev => {
                const next = new Set(prev)
                next.delete(data.userId)
                return next
            })
        }

        socket.on('onlineUsers', handleOnlineUsers)
        socket.on('userOnline', handleUserOnline)
        socket.on('userOffline', handleUserOffline)

        socket.emit('getOnlineUsers')

        return () => {
            socket.off('onlineUsers', handleOnlineUsers)
            socket.off('userOnline', handleUserOnline)
            socket.off('userOffline', handleUserOffline)
        }
    }, [])


    return (
        <>
            {/* Friend Sidebar */}
            <div
                className="hidden xl:flex xl:flex-col xl:fixed xl:inset-y-0 xl:right-0 xl:w-64 z-40 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out
                dark:border-gray-700 dark:text-white dark:bg-black dark:bg-opacity-900 dark:shadow-none"
                style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
            >
                <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <span className="font-semibold text-lg">{t('friend')}</span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{friends.length} friends</div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 -mr-1"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <button
                    onClick={handleOpenFriendRequests}
                    className="flex items-center justify-between gap-2 px-4 py-2.5 mx-3 mt-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:bg-opacity-50 transition-colors duration-150 text-sm font-medium"
                >
                    <span>{t('friend_requests')}</span>
                    <span className="inline-flex items-center justify-center rounded-full bg-green-500 text-white text-xs font-semibold px-2 min-w-[20px] h-5">
                        {friendRequests.length}
                    </span>
                </button>

                <FriendRequestModal
                    isOpen={isOpenModel}
                    onClose={() => setIsOpenModel(false)}
                    requests={friendRequests}
                    onAcceptFriend={handleAcceptFriend}
                />

                <FriendList friends={friends} onOpenChat={handleOpenChat} onlineUserIds={onlineUserIds} />
            </div>

            {/* Floating Friend Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
                >
                    <Users className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                    {friendRequests.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                            {friendRequests.length > 9 ? '9+' : friendRequests.length}
                        </span>
                    )}
                </button>
            )}

            {/* Chat Windows */}
            <div className="fixed bottom-1 right-64 z-50">
                <div className="relative">
                    {openChats.map((popup, index) => (
                        <ChatWindow
                            key={popup.conversationId}
                            user={popup.user}
                            popupIndex={index}
                            onClose={handleCloseChat}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default Online
