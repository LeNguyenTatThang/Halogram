import configAxios from "../api/axios"

export const addFriend = async (friendId: string) => {
    const res = await configAxios.post('/friendships/add-friend', { friendId: friendId })
    return res.data
}

export const acceptFriend = async (friendId: string) => {
    const res = await configAxios.post('/friendships/accept-friend', { friendId: friendId })
    return res.data
}

export const cancelFriend = async (friendId: string) => {
    const res = await configAxios.post('/friendships/cancel-friend', { friendId: friendId })
    return res.data
}

export const listFriends = async () => {
    const res = await configAxios.get('/friendships/friendships')
    return res.data
}

export const listFriendRequests = async () => {
    const res = await configAxios.get('/friendships/friendship-requests')
    return res.data
}

export const listResponseFriendRequests = async () => {
    const res = await configAxios.get('/friendships/list-response-friend-requests')
    return res.data
}

export const blockFriend = async (friendId: string) => {
    const res = await configAxios.post('/friendships/block-friend', { friendId: friendId })
    return res.data
}

export const listBlockedFriends = async () => {
    const res = await configAxios.get('/friendships/list-blocked-friends')
    return res.data
}

export const unblockFriend = async (friendId: string) => {
    const res = await configAxios.post('/friendships/unblock-friend', { friendId: friendId })
    return res.data
}

export const removeFriend = async (friendId: string) => {
    const res = await configAxios.post('/friendships/remove-friend', { friendId: friendId })
    return res.data
}