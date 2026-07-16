import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useRTC } from '../../hooks/useWebRTC';
import defaultAvatar from '../../assets/Logo.png';
import { useEffect, useState } from 'react';

interface VideoCallProps {
    open: boolean;
    username: string;
    avatar?: string | null;
    onClose: () => void;
}

const VideoCall = ({
    open,
    username,
    avatar,
    onClose,
}: VideoCallProps) => {
    const {
        localVideoRef,
        remoteVideoRef,
        toggleMic,
        toggleCamera,
        stopCall,
        isMuted,
        cameraOff,
        startLocalStream
    } = useRTC();

    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Request media permissions when VideoCall opens
    useEffect(() => {
        if (!open) {
            stopCall();
            return;
        }

        const requestPermissions = async () => {
            setIsLoading(true);
            setPermissionError(null);
            try {
                await startLocalStream(true);
            } catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                console.error('Permission error:', err);
                if (err.name === 'NotAllowedError') {
                    setPermissionError('Permission denied. Please allow access to camera and microphone.');
                } else if (err.name === 'NotFoundError') {
                    setPermissionError('No camera or microphone found.');
                } else {
                    setPermissionError('Failed to access camera and microphone.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        requestPermissions();

        // Cleanup when component unmounts or dialog closes
        return () => {
            console.log('VideoCall unmounting, stopping stream');
        };
    }, [open, startLocalStream, stopCall]);

    if (!open) return null;

    const handleEndCall = () => {
        stopCall();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center">
            <div className="relative w-full h-full">

                {/* Remote Video */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover bg-neutral-900"
                />

                {/* Nếu chưa có remote video hoặc đang loading */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <img
                        src={avatar ?? defaultAvatar}
                        className="w-24 h-24 rounded-full mb-4"
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
                                onClick={onClose}
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

                {/* Local Video */}
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute bottom-24 right-6 w-72 rounded-xl border-2 border-white object-cover bg-black"
                />

                {/* Controls */}
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
    );
};

export default VideoCall;