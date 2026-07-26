import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Loader2 } from 'lucide-react'
import type { Livestream } from '../../types/livestream'
import { getActiveLivestreams } from '../../utils/livestream'
import LivestreamCard from '../../components/livestream/LivestreamCard'

const LivestreamPage: React.FC = () => {
  const navigate = useNavigate()
  const [livestreams, setLivestreams] = useState<Livestream[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActiveLivestreams()
      .then(setLivestreams)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Radio className="w-7 h-7 text-red-500" />
          <h1 className="text-2xl font-bold">Livestream</h1>
        </div>
        <button
          onClick={() => navigate('/livestream/start')}
          className="bg-red-500 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Go Live
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : livestreams.length === 0 ? (
        <div className="text-center py-20">
          <Radio className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No live streams right now</h2>
          <p className="text-gray-400 mb-6">Be the first to go live!</p>
          <button
            onClick={() => navigate('/livestream/start')}
            className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Go Live
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {livestreams.map((ls) => (
            <LivestreamCard key={ls.id} livestream={ls} />
          ))}
        </div>
      )}
    </div>
  )
}

export default LivestreamPage
