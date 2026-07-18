import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react'
import { useCall } from '../../context/useCall'
import defaultAvatar from '../../assets/Logo.png'
import { useEffect, useState } from 'react'

interface VideoCallProps {
    open: boolean
    username: string
    avatar?: string | null
    onClose: () => void
}

const VideoCall = ({
    open,
    username,
    avatar,
    onClose
}: VideoCallProps) => {
    const {
        localVideoRef,
        remoteVideoRef,
        localStream,
        remoteStream,
        toggleMic,
        toggleCamera,
        isMuted,
        cameraOff,
        startLocalStream,
        activeCall,
        endCall
    } = useCall()

    const [permissionError, setPermissionError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const init = async () => {
            if (!localStream.current && open) {
                setIsLoading(true)
                setPermissionError(null)
                try {
                    await startLocalStream(activeCall?.type === 'VIDEO')
                } catch (error) {
                    const err = error instanceof Error ? error : new Error(String(error))
                    if (err.name === 'NotAllowedError') {
                        setPermissionError('Permission denied. Please allow access to camera and microphone.')
                    } else if (err.name === 'NotFoundError') {
                        setPermissionError('No camera or microphone found.')
                    } else {
                        setPermissionError('Failed to access camera and microphone.')
                    }
                } finally {
                    setIsLoading(false)
                }
            }

            if (localVideoRef.current && localStream.current) {
                localVideoRef.current.srcObject = localStream.current
            }
        }
        init()
    }, [open, localVideoRef, localStream, startLocalStream, activeCall?.type])

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream.current) {
            remoteVideoRef.current.srcObject = remoteStream.current
        }
    }, [remoteVideoRef, remoteStream, remoteStream.current])

    if (!open) return null

    const handleEndCall = () => {
        if (activeCall) {
            endCall(activeCall)
        }
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center">
            <div className="relative w-full h-full">

                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover bg-neutral-900"
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <img
                        src={avatar ?? defaultAvatar}
                        className="w-24 h-24 rounded-full mb-4 object-cover"
                    />
                    <h2 className="text-xl font-semibold">
                        {username}
                    </h2>

                    {isLoading ? (
                        <p className="text-gray-300 mt-2">
                            Requesting camera & microphone permissions...
                        </p>
                    ) : permissionError ? (
                        <div className="text-center mt-4">
                            <p className="text-red-400 text-sm mb-2">
                                {permissionError}
                            </p>
                            <button
                                onClick={handleEndCall}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-300 mt-2">
                            Connecting...
                        </p>
                    )}
                </div>

                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute bottom-24 right-6 w-72 rounded-xl border-2 border-white object-cover bg-black"
                />

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-5">

                    <button
                        onClick={toggleMic}
                        disabled={isLoading || !!permissionError}
                        className="p-4 rounded-full bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isMuted ? (
                            <MicOff className="text-white" />
                        ) : (
                            <Mic className="text-white" />
                        )}
                    </button>

                    <button
                        onClick={toggleCamera}
                        disabled={isLoading || !!permissionError}
                        className="p-4 rounded-full bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cameraOff ? (
                            <VideoOff className="text-white" />
                        ) : (
                            <Video className="text-white" />
                        )}
                    </button>

                    <button
                        onClick={handleEndCall}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700"
                    >
                        <PhoneOff className="text-white" />
                    </button>

                </div>

            </div>
        </div>
    )
}

export default VideoCall