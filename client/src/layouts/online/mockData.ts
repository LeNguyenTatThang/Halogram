export interface User {
    id: number
    name: string
    online: boolean
    image: string
}

export interface FriendInfo {
    id: number
    username: string
    first_name: string
    last_name: string
    avatar: string | null
}

export interface FriendRequest {
    id: number
    user_id: number
    friend_id: number
    status: number
    created_at: string
    updated_at: string
    user_info: FriendInfo
    friend_info: FriendInfo
}

const defaultAvatar =
    'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=400'

const buildFriendRequest = (id: number, friend: FriendInfo): FriendRequest => ({
    id,
    user_id: 100 + id,
    friend_id: friend.id,
    status: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    user_info: {
        id: 999,
        username: 'demo_user',
        first_name: 'Demo',
        last_name: 'User',
        avatar: defaultAvatar,
    },
    friend_info: friend,
})

const demoFriends: FriendInfo[] = [
    {
        id: 1,
        username: 'alice',
        first_name: 'Alice',
        last_name: 'Nguyen',
        avatar: defaultAvatar,
    },
    {
        id: 2,
        username: 'bob',
        first_name: 'Bob',
        last_name: 'Tran',
        avatar: defaultAvatar,
    },
    {
        id: 3,
        username: 'carol',
        first_name: 'Carol',
        last_name: 'Pham',
        avatar: defaultAvatar,
    },
    {
        id: 4,
        username: 'david',
        first_name: 'David',
        last_name: 'Le',
        avatar: defaultAvatar,
    },
]

export const mockFriends: FriendRequest[] = demoFriends.map((friend, index) =>
    buildFriendRequest(index + 10, friend),
)

export const mockFriendRequests: FriendRequest[] = [
    buildFriendRequest(100, {
        id: 5,
        username: 'emma',
        first_name: 'Emma',
        last_name: 'Vo',
        avatar: defaultAvatar,
    }),
    buildFriendRequest(101, {
        id: 6,
        username: 'frank',
        first_name: 'Frank',
        last_name: 'Huynh',
        avatar: defaultAvatar,
    }),
]

export const defaultAvatarUrl = defaultAvatar
