import { io } from 'socket.io-client'

let socket = null

export const initSocket = (token) => {
  if (socket?.connected) return socket

  socket = io(import.meta.env.VITE_SOCKET_URL || '/', {
    auth:              { token },
    transports:        ['websocket', 'polling'],
    reconnection:      true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    timeout:           20000,
  })

  socket.on('connect',       () => console.log('🔌 Socket connected'))
  socket.on('disconnect',    (r) => console.log('🔌 Socket disconnected:', r))
  socket.on('connect_error', (e) => console.error('🔌 Socket error:', e.message))

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null }
}
