import { useState, useEffect, useRef, useCallback } from 'react'
import { socket } from '../lib/socket'
import type { LivestreamMessage, Livestream } from '../types/livestream'
import { getLivestreamById } from '../utils/livestream'

interface UseLivestreamOptions {
  livestreamId: string
  isStreamer: boolean
  onEnded?: () => void
}

export function useLivestream({ livestreamId, isStreamer, onEnded }: UseLivestreamOptions) {
  const [livestream, setLivestream] = useState<Livestream | null>(null)
  const [chatMessages, setChatMessages] = useState<LivestreamMessage[]>([])
  const [viewerCount, setViewerCount] = useState(0)
  const [isLive, setIsLive] = useState(true)
  const [loading, setLoading] = useState(true)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const viewerPeerRef = useRef<RTCPeerConnection | null>(null)

  const processedMessageIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await getLivestreamById(livestreamId)
        if (cancelled) return
        setLivestream(data)
        setViewerCount(data.viewerCount)
        setChatMessages(data.messages || [])
        data.messages?.forEach((m) => processedMessageIds.current.add(m.id))
        setIsLive(data.status === 'LIVE')
      } catch {
        setIsLive(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [livestreamId])

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    socket.emit('livestream:join', { livestreamId })

    const handleViewerCount = (data: { livestreamId: string; count: number }) => {
      if (data.livestreamId === livestreamId) {
        setViewerCount(data.count)
      }
    }

    const handleChatMessage = (message: LivestreamMessage) => {
      if (message.livestreamId !== livestreamId) return
      if (processedMessageIds.current.has(message.id)) return
      processedMessageIds.current.add(message.id)
      setChatMessages((prev) => [...prev, message])
    }

    const handleEnded = (data: { livestreamId: string }) => {
      if (data.livestreamId === livestreamId) {
        setIsLive(false)
        onEnded?.()
      }
    }

    const handleStreamerAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
      if (!viewerPeerRef.current) return
      try {
        await viewerPeerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer))
      } catch (err) {
        console.error('Error setting remote description:', err)
      }
    }

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
      if (viewerPeerRef.current) {
        try {
          await viewerPeerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
        } catch (err) {
          console.error('Error adding ICE candidate:', err)
        }
      }
    }

    const handleViewerOffer = async (data: { livestreamId: string; offer: RTCSessionDescriptionInit; viewerSocketId: string }) => {
      if (!isStreamer || !localStreamRef.current) return

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.1.google.com:19302' }],
      })

      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!)
      })

      pc.onicecandidate = (event) => {
        if (!event.candidate) return
        socket.emit('livestream:ice-candidate', {
          livestreamId,
          candidate: event.candidate.toJSON(),
          targetSocketId: data.viewerSocketId,
        })
      }

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      socket.emit('livestream:streamer-answer', {
        viewerSocketId: data.viewerSocketId,
        answer,
      })

      peerConnectionsRef.current.set(data.viewerSocketId, pc)
    }

    socket.on('livestream:viewer-count', handleViewerCount)
    socket.on('livestream:chat-message', handleChatMessage)
    socket.on('livestream:ended', handleEnded)
    socket.on('livestream:streamer-answer', handleStreamerAnswer)
    socket.on('livestream:ice-candidate', handleIceCandidate)

    if (isStreamer) {
      socket.on('livestream:viewer-offer', handleViewerOffer)
    }

    return () => {
      socket.off('livestream:viewer-count', handleViewerCount)
      socket.off('livestream:chat-message', handleChatMessage)
      socket.off('livestream:ended', handleEnded)
      socket.off('livestream:streamer-answer', handleStreamerAnswer)
      socket.off('livestream:ice-candidate', handleIceCandidate)

      if (isStreamer) {
        socket.off('livestream:viewer-offer', handleViewerOffer)
      }

      socket.emit('livestream:leave', { livestreamId })
    }
  }, [livestreamId, isStreamer, onEnded])

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      return stream
    } catch (err) {
      console.error('Failed to get user media:', err)
      throw err
    }
  }, [])

  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
  }, [])

  const stopAllPeers = useCallback(() => {
    for (const [, pc] of peerConnectionsRef.current) {
      pc.close()
    }
    peerConnectionsRef.current = new Map()

    if (viewerPeerRef.current) {
      viewerPeerRef.current.close()
      viewerPeerRef.current = null
    }
  }, [])

  const startViewerConnection = useCallback(async () => {
    if (!socket.connected) return

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.1.google.com:19302' }],
    })

    pc.ontrack = (event) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream()
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current
        }
      }
      event.streams[0].getTracks().forEach((track) => {
        remoteStreamRef.current?.addTrack(track)
      })
    }

    pc.onicecandidate = (event) => {
      if (!event.candidate) return
      socket.emit('livestream:ice-candidate', {
        livestreamId,
        candidate: event.candidate.toJSON(),
      })
    }

    pc.addTransceiver('video', { direction: 'recvonly' })
    pc.addTransceiver('audio', { direction: 'recvonly' })

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    viewerPeerRef.current = pc

    socket.emit('livestream:viewer-offer', {
      livestreamId,
      offer,
      viewerSocketId: socket.id,
    })
  }, [livestreamId])

  const sendMessage = useCallback((content: string) => {
    if (!socket.connected || !content.trim()) return
    socket.emit('livestream:chat-message', {
      livestreamId,
      content: content.trim(),
    })
  }, [livestreamId])

  const endStream = useCallback(() => {
    if (!socket.connected) return
    socket.emit('livestream:end', { livestreamId })
    stopLocalStream()
    stopAllPeers()
  }, [livestreamId, stopLocalStream, stopAllPeers])

  const cleanup = useCallback(() => {
    stopLocalStream()
    stopAllPeers()
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
  }, [stopLocalStream, stopAllPeers])

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    livestream,
    chatMessages,
    viewerCount,
    isLive,
    loading,
    localVideoRef,
    remoteVideoRef,
    localStreamRef,
    remoteStreamRef,
    startLocalStream,
    stopLocalStream,
    startViewerConnection,
    stopAllPeers,
    sendMessage,
    endStream,
    cleanup,
  }
}
