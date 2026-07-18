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
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([])

    const [isCalling, setIsCalling] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [cameraOff, setCameraOff] = useState(false)

    const createPeer = (onIceCandidate?: (candidate: RTCIceCandidate) => void) => {
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.1.google.com:19302'}
            ]
        })

        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                peer.addTrack(track, localStream.current!)
            })
        }

        peer.ontrack = (event) => {
            if (!remoteStream.current) {
                remoteStream.current = new MediaStream()

                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream.current
                }
            }

            event.streams[0].getTracks().forEach(track => {
                remoteStream.current?.addTrack(track)
            })
        }

        peer.onicecandidate = (event) => {
            if (!event.candidate) return
            console.log('ICE Candidate:', event.candidate)
            if (onIceCandidate) {
                onIceCandidate(event.candidate)
            }
        }

        peerConnection.current = peer

        return peer
    }

    const startLocalStream = useCallback(async (video = true) => {
        try {
            if (localStream.current) {
                return localStream.current;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false
            })

            localStream.current = stream

            if (peerConnection.current) {
                stream.getTracks().forEach(track => {
                    peerConnection.current?.addTrack(track, stream)
                })
            }
            
            const audioTracks = stream.getAudioTracks()
            const videoTracks = stream.getVideoTracks()
            
            if (audioTracks.length > 0) {
                audioTrack.current = audioTracks[0]
            }
            if (videoTracks.length > 0) {
                videoTrack.current = videoTracks[0]
            }

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream
            } else {
                console.warn('localVideoRef.current is null')
            }

            return stream
        } catch (error) {
            console.error('Error getting media stream:', error)
            throw error
        }
    }, [])

    const stopCall = useCallback(() => {
        
        peerConnection.current?.close()
        peerConnection.current = null
        pendingCandidates.current = []

        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                track.stop()
            })
        }

        if (remoteStream.current) {
            remoteStream.current.getTracks().forEach(track => {
                track.stop()
            })
        }

        if (blackCanvasStream.current) {
            blackCanvasStream.current.getTracks().forEach(track => track.stop())
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
    }, [])

    const toggleMic = useCallback(() => {
        if (!audioTrack.current) return

        audioTrack.current.enabled = !audioTrack.current.enabled
        setIsMuted(!audioTrack.current.enabled)
    }, [])

    const toggleCamera = useCallback(async () => {
        if (!localStream.current) return

        if (videoTrack.current && videoTrack.current.enabled) {
            videoTrack.current.stop()
            localStream.current.removeTrack(videoTrack.current)
            videoTrack.current = null
            
            if (localVideoRef.current) {
                const canvas = document.createElement('canvas')
                canvas.width = 640
                canvas.height = 350
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    ctx.fillStyle = '#000000'
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                }
                blackCanvasStream.current = canvas.captureStream(30)
                const newStream = new MediaStream();
                if (audioTrack.current) {
                    newStream.addTrack(audioTrack.current)
                }
                if (blackCanvasStream.current && blackCanvasStream.current.getVideoTracks()[0]) {
                    newStream.addTrack(blackCanvasStream.current.getVideoTracks()[0])
                }
                localVideoRef.current.srcObject = newStream
            }
            setCameraOff(true)
        } else {
            try {
                const videoStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 } }
                })
                
                const newVideoTrack = videoStream.getVideoTracks()[0]
                videoTrack.current = newVideoTrack
                
                if (blackCanvasStream.current) {
                    blackCanvasStream.current.getTracks().forEach(t => t.stop())
                    blackCanvasStream.current = null
                }
                
                const newStream = new MediaStream()
                if (audioTrack.current && audioTrack.current.enabled) {
                    newStream.addTrack(audioTrack.current)
                }
                newStream.addTrack(newVideoTrack)
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = newStream
                }
                
                localStream.current = newStream
                
                setCameraOff(false)
            } catch (error) {
                console.error('Failed to restart camera:', error)
                setCameraOff(true)
            }
        }
    }, [])

    const createOffer = async () => {
        if (!peerConnection.current) {
            throw new Error('PeerConnection not initialized')
        }

        const offer = await peerConnection.current.createOffer()

        await peerConnection.current.setLocalDescription(offer)

        return offer
    }

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        if (!peerConnection.current) {
            throw new Error('PeerConnection not initialized')
        }

        await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(offer)
        )

        for (const candidate of pendingCandidates.current) {
            try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
            } catch (error) {
                console.error('Error processing queued ICE candidate:', error)
            }
        }
        pendingCandidates.current = []
    }

    const createAnswer = async () => {
        if (!peerConnection.current) {
            throw new Error('PeerConnection not initialized')
        }

        const answer = await peerConnection.current.createAnswer()

        await peerConnection.current.setLocalDescription(answer)

        return answer
    }

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        if (!peerConnection.current) {
            throw new Error('PeerConnection not initialized')
        }

        await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(answer)
        )

        for (const candidate of pendingCandidates.current) {
            try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
            } catch (error) {
                console.error('Error processing queued ICE candidate:', error)
            }
        }
        pendingCandidates.current = []
    }

    const addIceCandidate = async (
        candidate: RTCIceCandidateInit
    ) => {
        if (!peerConnection.current) return

        if (!peerConnection.current.remoteDescription) {
            pendingCandidates.current.push(candidate)
            return
        }

        try {
            await peerConnection.current.addIceCandidate(
                new RTCIceCandidate(candidate)
            )
        } catch (error) {
            console.error('Error adding ICE candidate:', error)
        }
    }

    useEffect(() => {
        return () => {
            if (localStream.current || peerConnection.current){
                stopCall()
            }
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
        toggleCamera,

        createOffer,
        handleOffer,
        createAnswer,
        handleAnswer,
        addIceCandidate
    }
}