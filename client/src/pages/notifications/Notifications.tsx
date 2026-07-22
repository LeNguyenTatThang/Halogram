import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotifications } from '../../context/useNotifications'
import { timeAgo } from '../../hooks/useTimeAgo'
import { Bell } from 'lucide-react'
import type { Notification } from '../../types/Notification'

const defaultAvatarUrl =
  'https://ui-avatars.com/api/?name=User&background=random'

interface NotificationsProps {
  onClose?: () => void
}

const Notifications = ({ onClose }: NotificationsProps) => {
  const { t } = useTranslation('notifications')
  const { notifications, unreadCount, markAsRead, markAllAsRead, loadMore, hasMore } =
    useNotifications()
  const navigate = useNavigate()

  const handleClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }

    onClose?.()

    switch (notification.type) {
      case 'POST_LIKE':
      case 'POST_COMMENT':
      case 'POST_TAGGED':
        navigate('/')
        break
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPTED':
      case 'FOLLOW':
        navigate(`/profile/${notification.actor.username}`)
        break
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            {t('markAllAsRead')}
          </button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Bell className="w-12 h-12 mb-2" />
          <p className="text-sm">{t('empty')}</p>
        </div>
      )}

      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleClick(notification)}
          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
            notification.isRead
              ? 'hover:bg-gray-50 dark:hover:bg-gray-800'
              : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
          }`}
        >
          <img
            src={notification.actor.avatar || defaultAvatarUrl}
            alt={notification.actor.username}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-semibold">
                {notification.actor.displayName}
              </span>{' '}
              <span className="text-gray-600 dark:text-gray-400">
                {t(notification.type.toLowerCase())}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {timeAgo(notification.createdAt)}
            </p>
          </div>
          {!notification.isRead && (
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
          )}
        </div>
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          className="text-sm text-blue-500 hover:text-blue-600 text-center py-2"
        >
          {t('loadMore')}
        </button>
      )}
    </div>
  )
}

export default Notifications
