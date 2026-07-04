import { acceptFriend, listFriendRequests, listFriends } from '../utils/friend'
import React, { useEffect, useState } from 'react'
import FriendRequestModal from './online/FriendRequestModal'
import FriendList from './online/FriendList'
import ChatWindow from './online/ChatWindow'
import type {Friend, FriendUser} from '../types/Friend'
import { useTranslation } from 'react-i18next'

const Online: React.FC = () => {
    const { t } = useTranslation('chat')
    const [isOpen, setIsOpen] = useState<boolean>(true)
    const [activeChats, setActiveChats] = useState<FriendUser[]>([])
    const [friends, setFriends] = useState<Friend[]>([])
    const [friendRequests, setFriendRequests] = useState<Friend[]>([])
    const [isOpenModel, setIsOpenModel] = useState<boolean>(false)
    const openChat = (user: FriendUser) => {
        const alreadyOpen = activeChats.find(u => u.id === user.id)
        if (alreadyOpen) return

        if (activeChats.length < 3) {
            setActiveChats([...activeChats, user])
        } else {
            setActiveChats([...activeChats.slice(1), user])
        }
    }

    const closeChat = (id: string) => {
        setActiveChats(activeChats.filter(u => u.id !== id))
    }

    const getListFriends = async () => {
        try {
            const res = await listFriends()
            setFriends(res.data)

        } catch (err) {
            console.log(err)
        }
    }

    const fetchFriendRequests = async () => {
        try {
            const res = await listFriendRequests()

            if (res.success) {
                setFriendRequests(res.data)
            }
        } catch (err) {
            console.error(err)
        }
    }
    
    const handleAcceptFriend = async (friendId: string) => {
        try {
            const res = await acceptFriend(friendId)
            if (res.success) {
                setFriendRequests(prev => prev.filter(fr => fr.id !== friendId))
                getListFriends()
            } 
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
                const [friendsRes, requestsRes] = await Promise.all([
                    listFriends(),
                    listFriendRequests(),
                ])

                if (friendsRes.success) {
                    setFriends(friendsRes.data)
                }

                if (requestsRes.success) {
                    setFriendRequests(requestsRes.data)
                }
            } catch (err) {
                console.error(err)
            }
        }

        loadData()
    }, [])


    return (
        <>
            {isOpen && (
                <div className="hidden xl:flex xl:flex-col xl:fixed xl:inset-y-0 xl:right-0 xl:w-64 xl:bg-white xl:border-l xl:border-gray-200 z-40 shadow-lg
                dark:border-gray-700 dark:text-white dark:bg-black dark:bg-opacity-900 dark:shadow-none">
                    <div className="flex items-center justify-between px-4 py-4 border-b">
                        <span className="font-semibold text-lg">{t('friend')}</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-black text-lg font-bold cursor-pointer
                            dark:hover:text-white transition-colors"
                            title={t('minimize')}
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

                    <button
                        onClick={handleOpenFriendRequests}
                        className="flex items-center justify-between gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-200 text-sm font-medium
                        dark:hover:bg-gray-700 dark:hover:bg-opacity-50 transition-colors"
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

                    <FriendList friends={friends} onOpenChat={openChat} />
                </div>
            )}
            {!isOpen && (
                <div className="fixed bottom-4 right-4 z-50">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-white border border-gray-300 shadow px-4 py-2 rounded-full hover:bg-gray-100 transition"
                    >
                        {t('friend')}
                    </button>
                </div>
            )}
            <div className="fixed bottom-1 right-64 z-50">
                <div className="relative">
                    {activeChats.map((user, index) => (
                        <ChatWindow
                            key={user.id}
                            user={user}
                            index={index}
                            onClose={closeChat}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default Online