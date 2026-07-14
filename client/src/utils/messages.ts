import configAxios from '../api/axios'

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export const createConversation = async (friendId: string) => {
    const res = await configAxios.post('/messages/conversations', { friendId }, {
        headers: getAuthHeaders(),
    })
    return res.data
}

export const getConversationMessages = async (conversationId: string, limit = 50) => {
    const res = await configAxios.get(`/messages/conversations/${conversationId}/messages`, {
        params: { limit },
        headers: getAuthHeaders(),
    })
    return res.data
}

export const sendConversationMessage = async (conversationId: string, content: string) => {
    const res = await configAxios.post('/messages', { conversationId, content }, {
        headers: getAuthHeaders(),
    })
    return res.data
}
