import configAxios from "../api/axios"

export const addFriend = async (friendId: number) => {
    const res = await configAxios.post('/friend/add-friend', { friend_id: friendId })
    return res.data
}

export const acceptFriend = async (friendId: number) => {
    const res = await configAxios.post('/friend/accept-friend', { friend_id: friendId })
    return res.data
}

export const cancelFriend = async (friendId: number) => {
    const res = await configAxios.post('/friend/cancel-friend', { friend_id: friendId })
    return res.data
}

export const listFriends = async () => {
    const res = await configAxios.get('/friend/list-friends')
    return res.data
}

export const listFriendRequests = async () => {
    const res = await configAxios.get('/friend/list-friend-requests')
    return res.data
}

export const listResponseFriendRequests = async () => {
    const res = await configAxios.get('/friend/list-response-friend-requests')
    return res.data
}

export const blockFriend = async (friendId: number) => {
    const res = await configAxios.post('/friend/block-friend', { friend_id: friendId })
    return res.data
}

export const listBlockedFriends = async () => {
    const res = await configAxios.get('/friend/list-blocked-friends')
    return res.data
}

export const unblockFriend = async (friendId: number) => {
    const res = await configAxios.post('/friend/unblock-friend', { friend_id: friendId })
    return res.data
}

export const removeFriend = async (friendId: number) => {
    const res = await configAxios.post('/friend/remove-friend', { friend_id: friendId })
    return res.data
}