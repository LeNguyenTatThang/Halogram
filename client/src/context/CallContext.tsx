import { createContext, useEffect, useMemo, useState, useRef, type ReactNode } from "react"
import { socket } from "../lib/socket"
import type { CallPayload } from "../types/call"
import { useRTC } from "../hooks/useWebRTC"

interface CallContextType {
    incomingCall: CallPayload | null
    outgoingCall: CallPayload | null
    activeCall: CallPayload | null

    calling: boolean
    inCall: boolean

    joinCall: (roomId: string) => void
    leaveCall: (roomId: string) => void

    callUser: (payload: CallPayload) => void
    acceptCall: (payload: CallPayload) => void
    rejectCall: (payload: CallPayload) => void
    endCall: (payload: CallPayload) => void

    clearIncomingCall: () => void

    // WebRTC properties exposed to UI
    localVideoRef: React.RefObject<HTMLVideoElement | null>
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>
    localStream: React.MutableRefObject<MediaStream | null>
    remoteStream: React.MutableRefObject<MediaStream | null>
    isMuted: boolean
    cameraOff: boolean
    toggleMic: () => void
    toggleCamera: () => void
    startLocalStream: (video?: boolean) => Promise<MediaStream>
    stopCall: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const CallContext = createContext<CallContextType | null>(null)

export function CallProvider({
    children,
}: {
    children: ReactNode
}) {
    const rtc = useRTC()
    const [incomingCall, setIncomingCall] = useState<CallPayload | null>(null)
    const [outgoingCall, setOutgoingCall] = useState<CallPayload | null>(null)
    const [activeCall, setActiveCall] = useState<CallPayload | null>(null)
    
    const [calling, setCalling] = useState(false)
    const [inCall, setInCall] = useState(false)

    // Keep Refs to always access the latest state in socket event listeners
    const outgoingCallRef = useRef<CallPayload | null>(null)
    useEffect(() => {
        outgoingCallRef.current = outgoingCall
    }, [outgoingCall])

    useEffect(() => {
        socket.on('incomingCall', (payload: CallPayload) => {
            socket.emit('joinCall', payload.roomId); // Ensure callee joins the room
            setIncomingCall(payload);
            setActiveCall(payload);
        })

        socket.on('callAccepted', async () => {
            const currentOutgoing = outgoingCallRef.current;
            // If this client has an outgoing call, it's the caller: create and send the offer.
            if (currentOutgoing) {
                setCalling(false);
                setInCall(true);
                const offer = await rtc.createOffer();
                socket.emit('offer', {
                    roomId: currentOutgoing.roomId,
                    offer,
                });
            } else {
                // Callee: just stop the calling spinner, wait for offer/answer flow.
                setCalling(false);
                // Do not set inCall here; will be set after answer is processed.
            }
        })

        socket.on('answer', async ({ answer }) => {
            await rtc.handleAnswer(answer)
            // If we are the callee (no outgoing call), mark the call as active now.
            if (!outgoingCallRef.current) {
                setInCall(true);
            }
        })

        socket.on("offer", async ({ roomId, offer }) => {
            await rtc.handleOffer(offer)

            const answer = await rtc.createAnswer()

            socket.emit("answer", {
                roomId,
                answer,
            })
        })

        socket.on("iceCandidate", async ({ candidate }) => {
            await rtc.addIceCandidate(candidate)
        })

        socket.on('callRejected', () => {
            setCalling(false)
            setOutgoingCall(null)
            setActiveCall(null)
            rtc.stopCall()
        })

        socket.on('callEnded', () => {
            setCalling(false)
            setInCall(false)

            setIncomingCall(null)
            setOutgoingCall(null)
            setActiveCall(null)
            rtc.stopCall()
        })

        return () => {
            socket.off('incomingCall')
            socket.off('callAccepted')
            socket.off('callRejected')
            socket.off('callEnded')
            socket.off("offer")
            socket.off("answer")
            socket.off("iceCandidate")
        }
    }, [rtc])

    const joinCall = (roomId: string) => {
        socket.emit('joinCall', roomId)
    }

    const leaveCall = (roomId: string) => {
        socket.emit('leaveCall', roomId)
    }

    const callUser = async (payload: CallPayload) => {
        setOutgoingCall(payload)
        setActiveCall(payload)
        setCalling(true)

        await rtc.startLocalStream(payload.type === 'VIDEO')
        rtc.createPeer((candidate) => {
            socket.emit('iceCandidate', {
                roomId: payload.roomId,
                candidate
            })
        })

        socket.emit('callUser', payload)
    }

    const acceptCall = async (payload: CallPayload) => {
        await rtc.startLocalStream(payload.type === 'VIDEO')
        rtc.createPeer((candidate) => {
            socket.emit('iceCandidate', {
                roomId: payload.roomId,
                candidate
            })
        })

        socket.emit('acceptCall', payload)

        setIncomingCall(null)
        setActiveCall(payload)
        setInCall(true)
    }

    const rejectCall = (payload: CallPayload) => {
        socket.emit('rejectCall', payload)

        setIncomingCall(null)
        setActiveCall(null)
        rtc.stopCall()
    }

    const endCall = (payload: CallPayload) => {
        socket.emit('endCall', payload)

        setCalling(false)
        setInCall(false)

        setIncomingCall(null)
        setOutgoingCall(null)
        setActiveCall(null)
        rtc.stopCall()
    }

    const clearIncomingCall = () => {
        setIncomingCall(null)
        setActiveCall(null)
    }

    const value = useMemo(
        () => ({
            joinCall,
            leaveCall,

            incomingCall,
            outgoingCall,
            activeCall,

            calling,
            inCall,

            callUser,
            acceptCall,
            rejectCall,
            endCall,

            clearIncomingCall,

            localVideoRef: rtc.localVideoRef,
            remoteVideoRef: rtc.remoteVideoRef,
            localStream: rtc.localStream,
            remoteStream: rtc.remoteStream,
            isMuted: rtc.isMuted,
            cameraOff: rtc.cameraOff,
            toggleMic: rtc.toggleMic,
            toggleCamera: rtc.toggleCamera,
            startLocalStream: rtc.startLocalStream,
            stopCall: rtc.stopCall
        }),
        [
            incomingCall,
            outgoingCall,
            activeCall,
            calling,
            inCall,
            rtc.isMuted,
            rtc.cameraOff
        ]
    )
    return (
        <CallContext.Provider value={value}>
            {children}
        </CallContext.Provider>
    )
}