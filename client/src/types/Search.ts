export type FriendshipStatus =
    | 'NONE'
    | 'PENDING'
    | 'FRIENDS'

export interface SearchUser {
    id: string
    username: string
    displayName: string
    avatar: string | null
    friendshipStatus: FriendshipStatus
}
