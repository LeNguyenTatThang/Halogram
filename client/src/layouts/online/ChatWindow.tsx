import React from 'react'
import type { FriendUser } from '../../types/Friend'
import { motion } from "framer-motion"
import { Send, Phone, Video, X } from 'lucide-react'
const defaultAvatarUrl =
    'https://ui-avatars.com/api/?name=User&background=random'

interface ChatWindowProps {
    user: FriendUser
    index: number
    onClose: (id: string) => void
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user, index, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 h-96 w-80 rounded-xl shadow-2xl border border-gray-200 bg-white flex flex-col overflow-hidden animate-slide-up-fade dark:border-gray-700 dark:bg-black dark:bg-opacity-900 dark:text-white"
            style={{ right: `${index * 330 + 20}px`, zIndex: 50 }}
        >
            <div className="flex items-center justify-between px-2 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <div className="flex items-center gap-2">
                    <img src={user.avatar || defaultAvatarUrl} alt={user.username} className="w-8 h-8 rounded-full border-2 border-white" />
                    <span className="font-semibold text-sm">{user.username}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-purple-200 rounded-full transition" title="Gọi thoại">
                        <Phone size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-purple-200 rounded-full transition" title="Gọi video">
                        <Video size={16} />
                    </button>
                    <button
                        onClick={() => onClose(user.id)}
                        className="p-1.5 hover:bg-red-200 rounded-full transition"
                        title="Đóng chat"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
            <div className="flex-1 px-4 py-2 overflow-y-auto text-sm text-gray-700 space-y-3 bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
                <div className="flex items-end gap-2">
                    <img src={user.avatar || defaultAvatarUrl} alt={user.username} className="w-6 h-6 rounded-full self-end" />
                    <div className="bg-white rounded-lg px-3 py-2 shadow text-gray-800 max-w-[70%] dark:bg-gray-600 dark:text-gray-300">
                        <p className="leading-snug">Chào bạn!</p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-lg px-3 py-2 shadow max-w-[70%] dark:bg-blue-600">
                        <p className="leading-snug">Hello!</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center px-2 py-2 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-600">
                <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 text-sm px-2 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                />
                <button className="ml-2 p-2 text-blue-500 hover:bg-blue-100 rounded-full transition dark:hover:bg-gray-700 dark:text-blue-400" title="Gửi">
                    <Send size={20} />
                </button>
            </div>
        </motion.div>
    )
}

export default ChatWindow