import configAxios from '../api/axios'

export const getNotifications = async (cursor?: string) => {
  const params: Record<string, string> = {}
  if (cursor) params.cursor = cursor
  const res = await configAxios.get('/notifications', { params })
  return res.data
}

export const getUnreadCount = async () => {
  const res = await configAxios.get('/notifications/unread-count')
  return res.data
}

export const markAsRead = async (id: string) => {
  const res = await configAxios.patch(`/notifications/${id}/read`)
  return res.data
}

export const markAllAsRead = async () => {
  const res = await configAxios.patch('/notifications/read-all')
  return res.data
}
