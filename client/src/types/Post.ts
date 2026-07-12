export interface Post {
  id: string
  caption: string | null

  user: {
    id: string
    username: string
    displayName: string
    avatar: string | null
  }

  images?: {
    id: string
    url: string
  }[]

  comments?: {
    id: string
    text: string
    user: {
      id: string
      avatar: string
      username: string
    }
  }[] | null

  _count: {
    likes: number
    comments: number
  }

  createdAt: string
  updatedAt: string

  isLiked?: boolean
}