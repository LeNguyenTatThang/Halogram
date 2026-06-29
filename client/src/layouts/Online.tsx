import { acceptFriend, listFriendRequests, listFriends } from '../utils/friend'
import React, { useEffect, useState } from 'react'
import FriendRequestModal from './online/FriendRequestModal'
import FriendList from './online/FriendList'
import ChatWindow from './online/ChatWindow'
import { mockFriendRequests, mockFriends, type FriendRequest, type User } from './online/mockData'

const Online: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(true)
    const [activeChats, setActiveChats] = useState<User[]>([])
    const [friends, setFriends] = useState<FriendRequest[]>(mockFriends)
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(mockFriendRequests)
    const [isOpenModel, setIsOpenModel] = useState<boolean>(false)
    const openChat = (user: User) => {
        const alreadyOpen = activeChats.find(u => u.id === user.id)
        if (alreadyOpen) return

        if (activeChats.length < 3) {
            setActiveChats([...activeChats, user])
        } else {
            setActiveChats([...activeChats.slice(1), user])
        }
    }

    const closeChat = (id: number) => {
        setActiveChats(activeChats.filter(u => u.id !== id))
    }

    const getListFriends = async () => {
        try {
            const res = await listFriends()
            if (res.status_code === 200) {
                setFriends(res.data)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const fetchFriendRequests = async () => {
        try {
            const res = await listFriendRequests()

            if (res.status_code === 200) {
                setFriendRequests(res.data)
            }
        } catch (err) {
            console.error(err)
        }
    }
    
    const handleAcceptFriend = async (friendId: number) => {
        try {
            const res = await acceptFriend(friendId)
            if (res.status_code === 200) {
                console.log('Accepted friend request:', res.data)
            }
            setFriendRequests(friendRequests.filter(fr => fr.friend_info.id !== friendId))
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
                const [friendsRes, requestsRes] = await Promise.all([
                    listFriends(),
                    listFriendRequests(),
                ])

                if (friendsRes.status_code === 200) {
                    setFriends(friendsRes.data)
                }

                if (requestsRes.status_code === 200) {
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
                <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:right-0 md:w-64 md:bg-white md:border-l md:border-gray-200 z-40 shadow-lg
                dark:border-gray-700 dark:text-white dark:bg-black dark:bg-opacity-900 dark:shadow-none">
                    <div className="flex items-center justify-between px-4 py-4 border-b">
                        <span className="font-semibold text-lg">Friend</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-black text-lg font-bold cursor-pointer
                            dark:hover:text-white transition-colors"
                            title="Thu nhỏ"
                        >
                            –
                        </button>
                    </div>

                    <button
                        onClick={handleOpenFriendRequests}
                        className="flex items-center justify-between gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-200 text-sm font-medium
                        dark:hover:bg-gray-700 dark:hover:bg-opacity-50 transition-colors"
                    >
                        <span>Lời mời kết bạn</span>
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
                        Friend
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