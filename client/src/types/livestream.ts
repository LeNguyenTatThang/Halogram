export type LivestreamStatus = 'LIVE' | 'ENDED'

export interface LivestreamStreamer {
  id: string
  username: string
  displayName: string
  avatar: string | null
  isVerified: boolean
}

export interface LivestreamMessage {
  id: string
  livestreamId: string
  userId: string
  content: string
  createdAt: string
  user: LivestreamStreamer
}

export interface Livestream {
  id: string
  streamerId: string
  title: string
  status: LivestreamStatus
  startedAt: string
  endedAt: string | null
  viewerCount: number
  streamer: LivestreamStreamer
  messages: LivestreamMessage[]
  _count?: {
    messages: number
  }
}
