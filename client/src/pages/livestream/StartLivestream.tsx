import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Mic, MicOff, VideoOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { createLivestream } from '../../utils/livestream'
import HalogramLoading from '../../components/ui/HalogramLoading'

const StartLivestream: React.FC = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [starting, setStarting] = useState(false)
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null)
  const videoRef = (el: HTMLVideoElement | null) => {
    if (el && previewStream) {
      el.srcObject = previewStream
    }
  }

  useEffect(() => {
    let stream: MediaStream | null = null

    const startPreview = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        setPreviewStream(stream)
      } catch {
        toast.error('Cannot access camera or microphone')
      }
    }

    startPreview()

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const toggleMic = () => {
    if (previewStream) {
      previewStream.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled
      })
      setMicOn((prev) => !prev)
    }
  }

  const toggleCamera = () => {
    if (previewStream) {
      previewStream.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled
      })
      setCameraOn((prev) => !prev)
    }
  }

  const handleStartLive = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    setStarting(true)
    try {
      const livestream = await createLivestream(title.trim())
      navigate(`/livestream/${livestream.id}/broadcast`)
    } catch {
      toast.error('Failed to start livestream')
    } finally {
      setStarting(false)
    }
  }

  useEffect(() => {
    if (previewStream) {
      const videoEl = document.querySelector('video[data-preview]') as HTMLVideoElement | null
      if (videoEl) {
        videoEl.srcObject = previewStream
      }
    }
  }, [previewStream])

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/livestream')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Start Livestream</h1>
      </div>

      <div className="bg-black rounded-lg overflow-hidden mb-4 aspect-video relative">
        {previewStream ? (
          <video
            data-preview
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <HalogramLoading size="sm" showText={false} />
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Preview
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your livestream about?"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
            maxLength={255}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={toggleMic}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
              micOn
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}
          >
            {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            {micOn ? 'Microphone ON' : 'Microphone OFF'}
          </button>

          <button
            onClick={toggleCamera}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
              cameraOn
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}
          >
            {cameraOn ? <Camera className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            {cameraOn ? 'Camera ON' : 'Camera OFF'}
          </button>
        </div>

        <button
          onClick={handleStartLive}
          disabled={starting || !title.trim()}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {starting ? (
            <HalogramLoading size="sm" showText={false} />
          ) : (
            <>
              <span className="w-2 h-2 bg-white rounded-full" />
              Start Live
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default StartLivestream
