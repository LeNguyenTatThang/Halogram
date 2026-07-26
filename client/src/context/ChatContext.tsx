import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { socket } from '../lib/socket'
import { createConversation, getConversationMessages, getConversations } from '../utils/messages'
import { showDesktopNotification, setBrowserTitle, updateFaviconBadge } from '../utils/browserNotification'
import { useAuth } from '../hooks/useAuth'
import { playSound } from '../utils/sound'
import VerifiedBadge from '../components/common/VerifiedBadge'
import type { FriendUser } from '../types/Friend'

const defaultAvatarUrl = 'https://ui-avatars.com/api/?name=User&background=random'

export interface ChatMessage {
    id: string
    content: string
    senderId: string
    createdAt: string
    conversationId: string
}

export interface ChatPopup {
    conversationId: string
    user: FriendUser
    messages: ChatMessage[]
    conversationLoaded: boolean
}

interface ChatContextType {
    openChats: ChatPopup[]
    activeConversationId: string | null
    openChat: (user: FriendUser) => Promise<void>
    closeChat: (conversationId: string) => void
    setActiveConversation: (conversationId: string | null) => void
    addOptimisticMessage: (conversationId: string, message: ChatMessage) => void
}

export const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
    const { user: currentUser, isAuthenticated } = useAuth()
    const [openChats, setOpenChats] = useState<ChatPopup[]>([])
    const [activeConversationId, setActiveConversation] = useState<string | null>(null)
    const openChatsRef = useRef<ChatPopup[]>([])
    const activeConversationIdRef = useRef<string | null>(null)
    const processedMessageIds = useRef(new Set<string>())
    const globalUnreadCount = useRef(0)

    useEffect(() => { openChatsRef.current = openChats }, [openChats])
    useEffect(() => { activeConversationIdRef.current = activeConversationId }, [activeConversationId])

    const showMessageNotification = useCallback((message: ChatMessage, senderUser: FriendUser) => {
        globalUnreadCount.current++
        setBrowserTitle(globalUnreadCount.current)
        updateFaviconBadge(globalUnreadCount.current)

        playSound('message')

        showDesktopNotification(
            senderUser.username || senderUser.displayName,
            message.content,
            senderUser.avatar || defaultAvatarUrl,
        )

        toast(
            (t) => (
                <div className="flex items-center gap-3" onClick={() => toast.dismiss(t.id)}>
                    <img
                        src={senderUser.avatar || defaultAvatarUrl}
                        alt={senderUser.username}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                        <span className="font-semibold text-sm inline-flex items-center gap-0.5">{senderUser.username || senderUser.displayName}{senderUser.isVerified && <VerifiedBadge />}</span>
                        <p className="text-sm text-gray-600 truncate">{message.content}</p>
                    </div>
                </div>
            ),
            { duration: 4000 },
        )
    }, [])

    const getOtherUserFromMembers = useCallback((members: Array<{ userId: string; user?: { id: string; username: string; avatar: string | null; email?: string } }>, currentUserId: string): FriendUser | null => {
        const other = members.find(m => m.userId !== currentUserId)
        if (!other) return null

        const otherUser = (other as { user: { id: string; username: string; avatar: string | null } }).user
        return {
            id: other.userId,
            username: otherUser?.username || other.userId,
            displayName: otherUser?.username || other.userId,
            avatar: otherUser?.avatar || null,
        }
    }, [])

    useEffect(() => {
        if (!isAuthenticated || !currentUser) {
            globalUnreadCount.current = 0
            setBrowserTitle(0)
            updateFaviconBadge(0)
            setOpenChats([])
            setActiveConversation(null)
            processedMessageIds.current.clear()
            return
        }

        const initConversations = async () => {
            try {
                const res = await getConversations()
                const conversations = res.data ?? []
                for (const conv of conversations) {
                    socket.emit('joinConversation', conv.id)
                }
            } catch {
                // silently fail
            }
        }

        initConversations()
    }, [isAuthenticated, currentUser])

    useEffect(() => {
        if (!isAuthenticated || !currentUser) return

        const handleReceiveMessage = async (message: ChatMessage) => {
            if (processedMessageIds.current.has(message.id)) return
            processedMessageIds.current.add(message.id)

            if (message.senderId === currentUser.id) return

            const currentChats = openChatsRef.current
            const currentActiveId = activeConversationIdRef.current
            const existingPopup = currentChats.find(c => c.conversationId === message.conversationId)

            if (existingPopup) {
                setOpenChats(prev => prev.map(c =>
                    c.conversationId === message.conversationId
                        ? { ...c, messages: [...c.messages, message] }
                        : c
                ))

                if (message.conversationId !== currentActiveId) {
                    showMessageNotification(message, existingPopup.user)
                }
            } else {
                try {
                    const convRes = await createConversation(message.senderId)
                    const convId = convRes.data?.id ?? convRes.data?.data?.id ?? message.conversationId

                    socket.emit('joinConversation', convId)

                    const members = convRes.data?.members ?? []
                    let otherUser: FriendUser | null = null

                    if (members.length > 0 && members[0].user) {
                        otherUser = getOtherUserFromMembers(members, currentUser.id)
                    }

                    if (!otherUser) {
                        try {
                            const listRes = await getConversations()
                            const convList = listRes.data ?? []
                            const found = convList.find((c: { id: string }) => c.id === convId)
                            if (found?.members) {
                                otherUser = getOtherUserFromMembers(found.members, currentUser.id)
                            }
                        } catch {
                            // fallback
                        }
                    }

                    if (!otherUser) {
                        otherUser = {
                            id: message.senderId,
                            username: message.senderId,
                            displayName: message.senderId,
                            avatar: null,
                        }
                    }

                    const historyRes = await getConversationMessages(convId)
                    const history = (historyRes.data ?? []).map((item: { id: string; content: string; senderId: string; createdAt: string }) => ({
                        id: item.id,
                        content: item.content,
                        senderId: item.senderId,
                        createdAt: item.createdAt,
                        conversationId: convId,
                    }))

                    setOpenChats(prev => {
                        if (prev.some(c => c.conversationId === convId)) return prev
                        return [...prev, {
                            conversationId: convId,
                            user: otherUser!,
                            messages: history,
                            conversationLoaded: true,
                        }]
                    })

                    showMessageNotification(message, otherUser)
                } catch (error) {
                    console.error('Failed to auto-open chat:', error)
                }
            }
        }

        socket.on('receiveMessage', handleReceiveMessage)

        return () => {
            socket.off('receiveMessage', handleReceiveMessage)
        }
    }, [isAuthenticated, currentUser, showMessageNotification, getOtherUserFromMembers])

    const openChat = useCallback(async (user: FriendUser) => {
        const existing = openChatsRef.current.find(c => c.user.id === user.id)
        if (existing) return

        try {
            const res = await createConversation(user.id)
            const conversationId = res.data?.id ?? res.data?.data?.id
            if (!conversationId) return

            socket.emit('joinConversation', conversationId)

            const historyRes = await getConversationMessages(conversationId)
            const history = (historyRes.data ?? []).map((item: { id: string; content: string; senderId: string; createdAt: string }) => ({
                id: item.id,
                content: item.content,
                senderId: item.senderId,
                createdAt: item.createdAt,
                conversationId,
            }))

            setOpenChats(prev => {
                if (prev.some(c => c.conversationId === conversationId)) return prev
                return [...prev, {
                    conversationId,
                    user,
                    messages: history,
                    conversationLoaded: true,
                }]
            })
        } catch (error) {
            console.error('Failed to open chat', error)
        }
    }, [])

    const closeChat = useCallback((conversationId: string) => {
        setOpenChats(prev => prev.filter(c => c.conversationId !== conversationId))
        if (activeConversationIdRef.current === conversationId) {
            setActiveConversation(null)
        }
    }, [])

    const addOptimisticMessage = useCallback((conversationId: string, message: ChatMessage) => {
        setOpenChats(prev => prev.map(c =>
            c.conversationId === conversationId
                ? { ...c, messages: [...c.messages, message] }
                : c
        ))
    }, [])

    const value = useMemo(() => ({
        openChats,
        activeConversationId,
        openChat,
        closeChat,
        setActiveConversation,
        addOptimisticMessage,
    }), [openChats, activeConversationId, openChat, closeChat, addOptimisticMessage, setActiveConversation])

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider')
    }
    return context
}
