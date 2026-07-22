export interface NotificationActor {
  id: string
  username: string
  displayName: string
  avatar: string | null
}

export type NotificationType =
  | 'POST_LIKE'
  | 'POST_COMMENT'
  | 'POST_TAGGED'
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'FOLLOW'

export interface Notification {
  id: string
  type: NotificationType
  actor: NotificationActor
  postId: string | null
  commentId: string | null
  isRead: boolean
  createdAt: string
}
