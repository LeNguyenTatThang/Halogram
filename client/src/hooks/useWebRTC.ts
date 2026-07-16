import { useCallback, useEffect, useRef, useState } from "react"

export function useRTC() {
    const localVideoRef = useRef<HTMLVideoElement | null>(null)
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

    const peerConnection = useRef<RTCPeerConnection | null>(null)
    const localStream = useRef<MediaStream | null>(null)
    const remoteStream = useRef<MediaStream | null>(null)
    const audioTrack = useRef<MediaStreamTrack | null>(null)
    const videoTrack = useRef<MediaStreamTrack | null>(null)
    const blackCanvasStream = useRef<MediaStream | null>(null)

    const [isCalling, setIsCalling] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [cameraOff, setCameraOff] = useState(false)

    const createPeer = () => {
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.1.google.com:19302'}
            ]
        })

        peerConnection.current = peer

        return peer
    }

    const startLocalStream = useCallback(async (video = true) => {
        try {
            // Nếu stream đã tồn tại, không cần gọi lại
            if (localStream.current) {
                console.log('Local stream already exists');
                return localStream.current;
            }

            console.log('Requesting media permissions...');
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false
            })

            localStream.current = stream
            
            // Store audio and video tracks separately
            const audioTracks = stream.getAudioTracks()
            const videoTracks = stream.getVideoTracks()
            
            if (audioTracks.length > 0) {
                audioTrack.current = audioTracks[0]
            }
            if (videoTracks.length > 0) {
                videoTrack.current = videoTracks[0]
            }
            
            console.log('Media stream obtained:', stream);

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream
                console.log('Stream assigned to video element');
            } else {
                console.warn('localVideoRef.current is null');
            }

            return stream
        } catch (error) {
            console.error('Error getting media stream:', error);
            throw error;
        }
    }, [])

    const stopCall = useCallback(() => {
        console.log('Stopping call...');
        
        peerConnection.current?.close()
        peerConnection.current = null

        // Stop all tracks
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                console.log('Stopping track:', track.kind);
                track.stop()
            })
        }

        if (remoteStream.current) {
            remoteStream.current.getTracks().forEach(track => {
                console.log('Stopping remote track:', track.kind);
                track.stop()
            })
        }

        // Stop canvas stream if exists
        if (blackCanvasStream.current) {
            blackCanvasStream.current.getTracks().forEach(track => track.stop());
        }

        localStream.current = null
        remoteStream.current = null
        audioTrack.current = null
        videoTrack.current = null
        blackCanvasStream.current = null
        
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null
        }

        setIsCalling(false)
        setIsMuted(false)
        setCameraOff(false)
        console.log('Call stopped');
    }, [])

    const toggleMic = useCallback(() => {
        if (!audioTrack.current) {
            console.warn('No audio track');
            return;
        }

        audioTrack.current.enabled = !audioTrack.current.enabled
        setIsMuted(!audioTrack.current.enabled)
        console.log('Mic toggled:', audioTrack.current.enabled ? 'ON' : 'OFF');
    }, [])

    const toggleCamera = useCallback(async () => {
        if (!localStream.current) {
            console.warn('No local stream');
            return;
        }

        // If camera is on, turn it off
        if (videoTrack.current && videoTrack.current.enabled) {
            console.log('Turning camera OFF...');
            videoTrack.current.stop()
            localStream.current.removeTrack(videoTrack.current)
            videoTrack.current = null
            
            // Show black screen
            if (localVideoRef.current) {
                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 480;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                blackCanvasStream.current = canvas.captureStream(30);
                // Create a new MediaStream with audio only + black canvas
                const newStream = new MediaStream();
                if (audioTrack.current) {
                    newStream.addTrack(audioTrack.current);
                }
                if (blackCanvasStream.current && blackCanvasStream.current.getVideoTracks()[0]) {
                    newStream.addTrack(blackCanvasStream.current.getVideoTracks()[0]);
                }
                localVideoRef.current.srcObject = newStream;
                console.log('Camera OFF - showing black screen');
            }
            setCameraOff(true)
        } else {
            // Camera is off, turn it back on
            console.log('Turning camera ON...');
            try {
                const videoStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 } }
                })
                
                const newVideoTrack = videoStream.getVideoTracks()[0]
                videoTrack.current = newVideoTrack
                
                // Stop the canvas stream
                if (blackCanvasStream.current) {
                    blackCanvasStream.current.getTracks().forEach(t => t.stop());
                    blackCanvasStream.current = null;
                }
                
                // Create new stream with audio + video
                const newStream = new MediaStream();
                if (audioTrack.current && audioTrack.current.enabled) {
                    newStream.addTrack(audioTrack.current);
                }
                newStream.addTrack(newVideoTrack);
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = newStream;
                    console.log('Camera ON - video restored');
                }
                
                // Update local stream reference
                localStream.current = newStream;
                
                setCameraOff(false)
            } catch (error) {
                console.error('Failed to restart camera:', error);
                setCameraOff(true)
            }
        }
    }, [])

    useEffect(() => {
        return () => {
            stopCall()
        }
    }, [stopCall])

    return {
        peerConnection,

        localVideoRef,
        remoteVideoRef,

        localStream,
        remoteStream,

        isCalling,
        isMuted,
        cameraOff,

        createPeer,
        startLocalStream,
        stopCall,
        toggleMic,
        toggleCamera
    }
}