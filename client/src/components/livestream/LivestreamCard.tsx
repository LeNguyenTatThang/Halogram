import { Link } from 'react-router-dom'
import { Eye, Play } from 'lucide-react'
import type { Livestream } from '../../types/livestream'
import VerifiedBadge from '../common/VerifiedBadge'
import UserAvatar from '../ui/UserAvatar'

interface LivestreamCardProps {
  livestream: Livestream
}

const LivestreamCard: React.FC<LivestreamCardProps> = ({ livestream }) => {
  const timeAgo = new Date(livestream.startedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Link
      to={`/livestream/${livestream.id}`}
      className="group block bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>

        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white px-2 py-0.5 rounded text-xs">
          <Eye className="w-3 h-3" />
          {livestream.viewerCount.toLocaleString()}
        </div>

        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs">
          {timeAgo}
        </div>

        <Play className="w-10 h-10 text-white/50 group-hover:text-white/80 transition-colors" />
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <UserAvatar src={livestream.streamer.avatar} name={livestream.streamer.displayName || livestream.streamer.username} size={28} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm truncate">
                {livestream.streamer.displayName}
              </span>
              {livestream.streamer.isVerified && <VerifiedBadge />}
            </div>
            <span className="text-xs text-gray-500">@{livestream.streamer.username}</span>
          </div>
        </div>

        <p className="text-sm text-gray-700 line-clamp-2 leading-snug">
          {livestream.title}
        </p>

        {livestream._count && (
          <p className="text-xs text-gray-400 mt-1">
            {livestream._count.messages} messages
          </p>
        )}
      </div>
    </Link>
  )
}

export default LivestreamCard
