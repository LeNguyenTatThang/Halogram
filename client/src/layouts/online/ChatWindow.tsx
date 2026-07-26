import React, { useEffect, useRef, useState } from 'react'
import {
    setBrowserTitle,
    updateFaviconBadge,
} from '../../utils/browserNotification'
import type { FriendUser } from '../../types/Friend'
import { motion } from 'framer-motion'
import { Send, Phone, Video, X } from 'lucide-react'
import { socket } from '../../lib/socket'
import { sendConversationMessage } from '../../utils/messages'
import { useAuth } from '../../hooks/useAuth'
import { useCall } from '../../context/useCall'
import { useChat, type ChatMessage } from '../../context/ChatContext'
import VerifiedBadge from '../../components/common/VerifiedBadge'
import UserAvatar from '../../components/ui/UserAvatar'

interface ChatWindowProps {
    user: FriendUser
    popupIndex: number
    onClose: (id: string) => void
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user, popupIndex, onClose }) => {
    const { user: currentUser } = useAuth()
    const { joinCall, leaveCall, callUser } = useCall()
    const { openChats, addOptimisticMessage, setActiveConversation } = useChat()
    const [draft, setDraft] = useState('')
    const [peerTyping, setPeerTyping] = useState(false)
    const typingTimerRef = useRef<number | null>(null)
    const messageEndRef = useRef<HTMLDivElement | null>(null)
    const peerTypingTimerRef = useRef<number | null>(null)

    const popup = openChats.find((c: { user: { id: string } }) => c.user.id === user.id)
    const messages = popup?.messages ?? []
    const messagesLength = messages.length
    const conversationId = popup?.conversationId ?? null

    const handleVoiceCall = () => {
        if (!conversationId || !currentUser) return

        callUser({
            roomId: conversationId,
            callerId: currentUser.id,
            callerName: currentUser.username,
            callerAvatar: currentUser.avatar,
            receiverId: user.id,
            receiverName: user.username,
            receiverAvatar: user.avatar,
            type: 'AUDIO',
        })
    }

    const handleVideoCall = () => {
        if (!conversationId || !currentUser) return

        callUser({
            roomId: conversationId,
            callerId: currentUser.id,
            callerName: currentUser.username,
            callerAvatar: currentUser.avatar,
            receiverId: user.id,
            receiverName: user.username,
            receiverAvatar: user.avatar,
            type: 'VIDEO',
        })
    }

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messagesLength])

    useEffect(() => {
        setActiveConversation(conversationId)
        return () => {
            setActiveConversation(null)
        }
    }, [conversationId, setActiveConversation])

    useEffect(() => {
        if (!conversationId || !currentUser) return

        joinCall(conversationId)

        return () => {
            leaveCall(conversationId)
        }
    }, [conversationId, currentUser, joinCall, leaveCall])

    useEffect(() => {
        if (!currentUser) return

        const handleTyping = (payload: { conversationId: string; userId: string }) => {
            if (payload.conversationId !== conversationId || payload.userId === currentUser.id) return
            setPeerTyping(true)

            if (peerTypingTimerRef.current) {
                window.clearTimeout(peerTypingTimerRef.current)
            }
            peerTypingTimerRef.current = window.setTimeout(() => {
                setPeerTyping(false)
            }, 3000)
        }

        const handleStopTyping = (payload: { conversationId: string; userId: string }) => {
            if (payload.conversationId !== conversationId || payload.userId === currentUser.id) return
            setPeerTyping(false)
            if (peerTypingTimerRef.current) {
                window.clearTimeout(peerTypingTimerRef.current)
            }
        }

        socket.on('typing', handleTyping)
        socket.on('stopTyping', handleStopTyping)

        return () => {
            socket.off('typing', handleTyping)
            socket.off('stopTyping', handleStopTyping)
            if (peerTypingTimerRef.current) {
                window.clearTimeout(peerTypingTimerRef.current)
            }
        }
    }, [conversationId, currentUser])

    const emitTyping = (typing: boolean) => {
        if (!conversationId || !currentUser?.id) return

        if (typing) {
            socket.emit('typing', { conversationId, userId: currentUser.id })
        } else {
            socket.emit('stopTyping', { conversationId, userId: currentUser.id })
        }
    }

    const handleDraftChange = (value: string) => {
        setDraft(value)

        if (!conversationId || !currentUser?.id) return

        if (typingTimerRef.current) {
            window.clearTimeout(typingTimerRef.current)
        }

        if (value.trim()) {
            emitTyping(true)
            typingTimerRef.current = window.setTimeout(() => {
                emitTyping(false)
            }, 1200)
        } else {
            emitTyping(false)
        }
    }

    const sendMessage = async () => {
        if (!draft.trim() || !conversationId || !currentUser?.id) return

        const messagePayload: ChatMessage = {
            id: `${Date.now()}-${currentUser.id}`,
            content: draft.trim(),
            senderId: currentUser.id,
            createdAt: new Date().toISOString(),
            conversationId,
        }

        addOptimisticMessage(conversationId, messagePayload)
        socket.emit('sendMessage', messagePayload)
        emitTyping(false)
        setDraft('')

        try {
            await sendConversationMessage(conversationId, messagePayload.content)
        } catch (error) {
            console.error('Failed to persist message', error)
        }
    }

    useEffect(() => {
        const handleFocus = () => {
            const unread = 0
            setBrowserTitle(unread)
            updateFaviconBadge(unread)
        }

        window.addEventListener('focus', handleFocus)

        return () => {
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    const isOwnMessage = (senderId: string) => senderId === currentUser?.id

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 h-96 w-80 rounded-xl shadow-2xl border border-gray-200 bg-white flex flex-col overflow-hidden animate-slide-up-fade dark:border-gray-700 dark:bg-black dark:bg-opacity-900 dark:text-white"
            style={{ right: `${popupIndex * 330 + 20}px`, zIndex: 50 }}
        >
            <div className="flex items-center justify-between px-2 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <div className="flex items-center gap-2">
                    <UserAvatar src={user.avatar} name={user.displayName || user.username} size={32} className="ring-2 ring-white" />
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm leading-tight inline-flex items-center gap-0.5">{user.username}{user.isVerified && <VerifiedBadge className="text-white" />}</span>
                        <span className={`text-[11px] leading-tight ${peerTyping ? 'text-green-100 font-medium' : 'text-blue-100'}`}>
                            {peerTyping ? 'đang nhập...' : 'online'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleVoiceCall}
                        className="p-1.5 hover:bg-purple-200 rounded-full transition" title="Gọi thoại"
                    >
                        <Phone size={16} />
                    </button>
                    <button
                        onClick={handleVideoCall}
                        className="p-1.5 hover:bg-purple-200 rounded-full transition" title="Gọi video"
                    >
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
                {peerTyping && (
                    <div className="flex items-end gap-2 animate-pulse">
                        <UserAvatar src={user.avatar} name={user.displayName || user.username} size={24} className="self-end" />
                        <div className="bg-white rounded-full px-3 py-2 shadow text-gray-800 dark:bg-gray-600 dark:text-gray-300 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0ms]" />
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]" />
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:300ms]" />
                        </div>
                    </div>
                )}
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${isOwnMessage(message.senderId) ? 'justify-end' : 'items-end gap-2'}`}>
                        {!isOwnMessage(message.senderId) && (
<UserAvatar src={user.avatar} name={user.displayName || user.username} size={24} className="self-end" />
                        )}
                        <div className={`rounded-lg px-3 py-2 shadow max-w-[70%] ${isOwnMessage(message.senderId) ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 dark:bg-gray-600 dark:text-gray-300'}`}>
                            <p className="leading-snug">{message.content}</p>
                        </div>
                    </div>
                ))}
                <div ref={messageEndRef} />
            </div>
            <div className="flex items-center px-2 py-2 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-600">
                <input
                    type="text"
                    value={draft}
                    onChange={(event) => handleDraftChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault()
                            sendMessage()
                        }
                    }}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 text-sm px-2 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                />
                <button
                    onClick={sendMessage}
                    className="ml-2 p-2 text-blue-500 hover:bg-blue-100 rounded-full transition dark:hover:bg-gray-700 dark:text-blue-400"
                    title="Gửi"
                >
                    <Send size={20} />
                </button>
            </div>
        </motion.div>
    )
}

export default ChatWindow
