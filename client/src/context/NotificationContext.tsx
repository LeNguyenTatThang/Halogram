import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { socket } from '../lib/socket'
import { getNotifications, getUnreadCount, markAsRead as markAsReadApi, markAllAsRead as markAllAsReadApi } from '../utils/notification'
import type { Notification } from '../types/Notification'
import { useAuth } from '../hooks/useAuth'

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
        const data = notifRes.data ?? notifRes
        setNotifications(data.data ?? [])
        setNextCursor(data.nextCursor ?? null)
        setHasMore(!!data.nextCursor)
        notificationIdsRef.current = new Set((data.data ?? []).map((n: Notification) => n.id))
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
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: n.isRead })))
      setUnreadCount(prevUnread)
    }
  }, [unreadCount])

  const loadMore = useCallback(async () => {
    if (!nextCursor) return
    try {
      const res = await getNotifications(nextCursor)
      const data = res.data ?? res
      const newItems = (data.data ?? []).filter(
        (n: Notification) => !notificationIdsRef.current.has(n.id),
      )
      newItems.forEach((n: Notification) => notificationIdsRef.current.add(n.id))
      setNotifications((prev) => [...prev, ...newItems])
      setNextCursor(data.nextCursor ?? null)
      setHasMore(!!data.nextCursor)
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
