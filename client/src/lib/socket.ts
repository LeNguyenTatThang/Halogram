import { io } from 'socket.io-client'

const getSocketToken = () => localStorage.getItem('accessToken') ?? ''

export const socket = io('http://localhost:3000/haloggram', {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: {
        token: getSocketToken(),
    },
})

export const connectSocket = () => {
    const token = getSocketToken()

    if (!token) {
        return false
    }

    socket.auth = { token }

    if (!socket.connected) {
        socket.connect()
    }

    return true
}
