import type { User } from "./User"

export interface Story {
    id: string
    user: User
    image: string
    isViewed: boolean
    timestamp: string
}