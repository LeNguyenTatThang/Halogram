import type { User } from "./User"

export interface PostComment {
  id: string
  user: User
  text: string
  timestamp: string
  likes: number
}

export interface Post {
  id: string
  user: User
  image: string
  caption: string
  likes: number
  comments: PostComment[]
  timestamp: string
  isLiked: boolean
}