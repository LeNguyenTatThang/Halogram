import React from 'react'
import type { User } from './mockData'

interface ChatWindowProps {
    user: User
    index: number
    onClose: (id: number) => void
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user, index, onClose }) => {
    return (
        <div
            className="absolute bottom-1 h-96 w-80 rounded-xl shadow-2xl border border-gray-200 bg-white flex flex-col overflow-hidden animate-slide-up-fade dark:border-gray-700 dark:bg-black dark:bg-opacity-900 dark:text-white"
            style={{ right: `${index * 330 + 20}px`, zIndex: 50 }}
        >
            <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <div className="flex items-center gap-2">
                    <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full border-2 border-white" />
                    <span className="font-semibold text-sm">{user.name}</span>
                </div>
                <button
                    onClick={() => onClose(user.id)}
                    className="text-white hover:text-red-200 text-lg leading-none"
                    title="Đóng chat"
                >
                    ✕
                </button>
            </div>
            <div className="flex-1 px-4 py-2 overflow-y-auto text-sm text-gray-700 space-y-3 bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
                <div className="flex items-end gap-2">
                    <img src={user.image} alt={user.name} className="w-6 h-6 rounded-full self-end" />
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
            <div className="flex items-center px-3 py-2 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-600">
                <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                />
                <button className="ml-2 px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 transition">
                    Gửi
                </button>
            </div>
        </div>
    )
}

export default ChatWindow
