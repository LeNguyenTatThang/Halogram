import { useContext } from 'react'
import { NotificationContext } from './NotificationContextType'
import type { NotificationContextType } from './NotificationContextType'

export function useNotifications(): NotificationContextType {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return ctx
}
