export interface TaggedUser {
  id: string
  username: string
  displayName: string
  avatar: string | null
  isVerified?: boolean
}

export interface Post {
  id: string
  caption: string | null

  user: {
    id: string
    username: string
    displayName: string
    avatar: string | null
    isVerified?: boolean
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
      isVerified?: boolean
    }
  }[] | null

  tags?: {
    user: TaggedUser
  }[]

  _count: {
    likes: number
    comments: number
  }

  createdAt: string
  updatedAt: string

  isLiked?: boolean
  isSaved?: boolean
  isTagged?: boolean
}