import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Eye } from 'lucide-react'
import { useLivestream } from '../../hooks/useLivestream'
import LivestreamChat from '../../components/livestream/LivestreamChat'
import VerifiedBadge from '../../components/common/VerifiedBadge'
import HalogramLoading from '../../components/ui/HalogramLoading'

const LivestreamViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    livestream,
    chatMessages,
    viewerCount,
    isLive,
    loading,
    remoteVideoRef,
    startViewerConnection,
    sendMessage,
    cleanup,
  } = useLivestream({
    livestreamId: id || '',
    isStreamer: false,
    onEnded: () => {},
  })

  useEffect(() => {
    if (livestream && isLive) {
      startViewerConnection()
    }
  }, [livestream, isLive, startViewerConnection])

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <HalogramLoading size="lg" text="Đang tải..." />
      </div>
    )
  }

  if (!livestream) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <p className="text-lg text-gray-500 mb-4">Livestream not found</p>
        <button
          onClick={() => navigate('/livestream')}
          className="text-blue-500 hover:underline"
        >
          Back to Livestream
        </button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-black">
      <div className="relative flex-1 flex items-center justify-center bg-black">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />

        {!isLive && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <p className="text-white text-xl font-semibold mb-2">Livestream ended</p>
            <button
              onClick={() => navigate('/livestream')}
              className="text-blue-400 hover:underline text-sm"
            >
              Back to Livestream
            </button>
          </div>
        )}

        {isLive && (
          <>
            <div className="absolute top-4 left-4 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
                <img
                  src={livestream.streamer.avatar || '/default-avatar.png'}
                  alt={livestream.streamer.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-white text-sm font-semibold">
                      {livestream.streamer.displayName}
                    </span>
                    {livestream.streamer.isVerified && <VerifiedBadge />}
                  </div>
                  <span className="text-gray-300 text-xs">@{livestream.streamer.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-3">
              <div className="flex items-center gap-1 bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-full text-sm">
                <Eye className="w-4 h-4" />
                {viewerCount.toLocaleString()}
              </div>
              <button
                onClick={() => navigate('/livestream')}
                className="bg-black/50 backdrop-blur text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-20 pointer-events-none" />
      </div>

      <div className="w-full md:w-80 h-80 md:h-auto bg-white flex flex-col">
        <div className="px-3 py-2 border-b bg-gray-50">
          <h3 className="font-semibold text-sm truncate">{livestream.title}</h3>
        </div>
        <div className="flex-1 overflow-hidden">
          <LivestreamChat
            messages={chatMessages}
            onSend={sendMessage}
            disabled={!isLive}
          />
        </div>
      </div>
    </div>
  )
}

export default LivestreamViewer
