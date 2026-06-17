import type { User } from "./User";

export interface Comment {
    id: string
    user: User
    text: string
    timestamp: string
    likes: number
}