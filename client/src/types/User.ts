export interface User {
    id: string
    username: string
    displayName: string
    email: string
    firstName: string
    lastName: string
    avatar: string
    bio: string
    friends: number
    followers: number
    following: number
    posts: number
    isVerified?: boolean
    isFollowing?: boolean
}