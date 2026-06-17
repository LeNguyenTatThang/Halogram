import { acceptFriend, listFriendRequests, listFriends } from '../utils/friend'
import React, { useEffect, useState } from 'react'

type User = {
    id: number
    name: string
    online: boolean
    image: string
}

interface UserInfo {
    id: number
    username: string
    first_name: string
    last_name: string
    avatar: string | null
}

interface FriendRequest {
    id: number
    user_id: number
    friend_id: number
    status: number
    created_at: string
    updated_at: string
    user_info: UserInfo
    friend_info: UserInfo
}


const Online: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(true)
    const [activeChats, setActiveChats] = useState<User[]>([])
    const [friends, setFriends] = useState<FriendRequest[]>([])
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
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
                <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:right-0 md:w-64 md:bg-white md:border-l md:border-gray-200 z-40 shadow-lg">
                    <div className="flex items-center justify-between px-4 py-4 border-b">
                        <span className="font-semibold text-lg">Friend</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-black text-lg font-bold cursor-pointer"
                            title="Thu nhỏ"
                        >
                            –
                        </button>
                    </div>
                    {/* Loi moi ket ban */}
                    <button
                        onClick={handleOpenFriendRequests}
                        className="flex items-center justify-between gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-200 text-sm font-medium">
                        <span>Lời mời kết bạn</span>
                        <span className="inline-flex items-center justify-center rounded-full bg-green-500 text-white text-xs font-semibold px-2 min-w-[20px] h-5">
                            1
                        </span>
                    </button>
                    {isOpenModel && (
                        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
                                <div className="flex items-center justify-between p-4 border-b">
                                    <h2 className="text-lg font-semibold">
                                        Lời mời kết bạn
                                    </h2>
                                    <button
                                        onClick={() => setIsOpenModel(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full"
                                    >
                                        x
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-4 py-2">
                                    {friendRequests.length === 0 && (
                                        <p className="text-center text-gray-500">Không có lời mời kết bạn nào</p>
                                    )}

                                    {friendRequests.map(friend => (
                                        <div
                                            key={friend.id}
                                            className="flex items-center justify-between mb-3 px-2 py-1 rounded hover:bg-gray-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={friend.friend_info.avatar ? friend.friend_info.avatar : 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=400'}
                                                    alt={friend.friend_info.username}
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                                <span className="text-sm font-medium">
                                                    {friend.friend_info?.first_name} {friend.friend_info?.last_name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleAcceptFriend(friend.friend_info.id)}
                                                    className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 transition">
                                                    Chấp nhận
                                                </button>
                                                <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition">
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto px-4 py-2">
                        <div
                            onClick={() => openChat({ id: 0, name: "Tất cả bạn bè", online: true, image: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=400' })}
                            className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
                            <div className="flex items-center gap-3">
                                <img
                                    src='https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=400'
                                    alt='Tất cả bạn bè'
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="text-sm font-medium">test</span>
                            </div>
                            <span
                                className='h-3 w-3 rounded-full bg-green-500'
                            ></span>
                        </div>
                        {friends.map(friend => (
                            <div
                                key={friend.id}
                                onClick={() => openChat({ id: friend.friend_info.id, name: friend.friend_info.first_name + ' ' + friend.friend_info.last_name, online: true, image: friend.friend_info.avatar ? friend.friend_info.avatar : 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=400' })}
                                className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={friend.friend_info.avatar ? friend.friend_info.avatar : 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=400'}
                                        alt={friend.friend_info.username}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <span className="text-sm font-medium">{friend.friend_info?.first_name} {friend.friend_info?.last_name}</span>
                                </div>
                                <span
                                    className='h-3 w-3 rounded-full bg-green-500'
                                ></span>
                            </div>
                        ))}
                    </div>
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
                        <div
                            key={user.id}
                            className="absolute bottom-1 h-96 w-80 rounded-xl shadow-2xl border border-gray-200 bg-white flex flex-col overflow-hidden animate-slide-up-fade"
                            style={{ right: `${index * 330 + 20}px`, zIndex: 50 }}
                        >
                            <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                <div className="flex items-center gap-2">
                                    <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full border-2 border-white" />
                                    <span className="font-semibold text-sm">{user.name}</span>
                                </div>
                                <button
                                    onClick={() => closeChat(user.id)}
                                    className="text-white hover:text-red-200 text-lg leading-none"
                                    title="Đóng chat"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex-1 px-4 py-2 overflow-y-auto text-sm text-gray-700 space-y-3 bg-gray-50">
                                <div className="flex items-end gap-2">
                                    <img
                                        src={user.image}
                                        alt={user.name}
                                        className="w-6 h-6 rounded-full self-end"
                                    />
                                    <div className="bg-white rounded-lg px-3 py-2 shadow text-gray-800 max-w-[70%]">
                                        <p className="leading-snug">Chào bạn!</p>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <div className="bg-blue-500 text-white rounded-lg px-3 py-2 shadow max-w-[70%]">
                                        <p className="leading-snug">Hello!</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center px-3 py-2 bg-white border-t border-gray-200">
                                <input
                                    type="text"
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400"
                                />
                                <button className="ml-2 px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 transition">
                                    Gửi
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Online