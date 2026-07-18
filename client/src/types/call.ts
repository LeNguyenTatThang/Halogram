export type CallType = 'AUDIO' | 'VIDEO'

export interface CallPayload {
    roomId: string

    callerId: string
    callerName?: string
    callerAvatar?: string | null

    receiverId: string
    receiverName?: string
    receiverAvatar?: string | null

    type: CallType

    offer?: RTCSessionDescriptionInit
    answer?: RTCSessionDescriptionInit
    candidate?: RTCIceCandidate
}