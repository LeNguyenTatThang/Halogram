import { createContext } from 'react'
import type { Notification } from '../types/Notification'

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
