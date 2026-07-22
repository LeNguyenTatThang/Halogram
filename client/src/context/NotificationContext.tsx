import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { socket } from '../lib/socket'
import { getNotifications, getUnreadCount, markAsRead as markAsReadApi, markAllAsRead as markAllAsReadApi } from '../utils/notification'
import type { Notification } from '../types/Notification'
import { useAuth } from '../hooks/useAuth'
import i18n from '../lib/i18n'

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  loadMore: () => Promise<void>
  hasMore: boolean
}

export const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const notificationIdsRef = useRef(new Set<string>())
  const listenerRegistered = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      setNextCursor(null)
      setHasMore(false)
      notificationIdsRef.current.clear()
      listenerRegistered.current = false
      return
    }

    const fetchInitial = async () => {
      try {
        const [notifRes, countRes] = await Promise.all([
          getNotifications(),
          getUnreadCount(),
        ])
        setNotifications(notifRes.data ?? [])
        setNextCursor(notifRes.nextCursor ?? null)
        setHasMore(!!notifRes.nextCursor)
        notificationIdsRef.current = new Set((notifRes.data ?? []).map((n: Notification) => n.id))
        setUnreadCount(countRes.count ?? countRes.data?.count ?? 0)
      } catch {
        // silently fail
      }
    }

    fetchInitial()
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    if (listenerRegistered.current) return

    const handleNewNotification = (notification: Notification) => {
      if (notificationIdsRef.current.has(notification.id)) return

      notificationIdsRef.current.add(notification.id)
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)

      const actionText = i18n.t(`notifications:${notification.type.toLowerCase()}`, '')
      toast(
        () => (
          <div className="flex items-center gap-3">
            <img
              src={notification.actor.avatar || `https://ui-avatars.com/api/?name=${notification.actor.username}&background=random`}
              alt={notification.actor.username}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="font-semibold text-sm">{notification.actor.displayName}</span>{' '}
              <span className="text-sm text-gray-600">{actionText}</span>
            </div>
          </div>
        ),
        { duration: 4000 },
      )
    }

    socket.on('notification:new', handleNewNotification)
    listenerRegistered.current = true

    return () => {
      socket.off('notification:new', handleNewNotification)
      listenerRegistered.current = false
    }
  }, [isAuthenticated])

  const addNotification = useCallback((notification: Notification) => {
    if (notificationIdsRef.current.has(notification.id)) return

    notificationIdsRef.current.add(notification.id)
    setNotifications((prev) => [notification, ...prev])
    setUnreadCount((prev) => prev + 1)
  }, [])

  const handleMarkAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
    try {
      await markAsReadApi(id)
    } catch {
      // revert on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      )
      setUnreadCount((prev) => prev + 1)
    }
  }, [])

  const handleMarkAllAsRead = useCallback(async () => {
    const prevUnread = unreadCount
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
    try {
      await markAllAsReadApi()
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: false })))
      setUnreadCount(prevUnread)
    }
  }, [unreadCount])

  const loadMore = useCallback(async () => {
    if (!nextCursor) return
    try {
      const res = await getNotifications(nextCursor)
      const newItems = (res.data ?? []).filter(
        (n: Notification) => !notificationIdsRef.current.has(n.id),
      )
      newItems.forEach((n: Notification) => notificationIdsRef.current.add(n.id))
      setNotifications((prev) => [...prev, ...newItems])
      setNextCursor(res.nextCursor ?? null)
      setHasMore(!!res.nextCursor)
    } catch {
      // silently fail
    }
  }, [nextCursor])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        loadMore,
        hasMore,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
