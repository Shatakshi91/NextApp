import { useRef, useCallback } from 'react'
import { getSocket } from '../utils/socket'

export function useDMTyping(receiverId) {
  const typingRef = useRef(false)
  const timer     = useRef(null)

  const onType = useCallback(() => {
    const socket = getSocket()
    if (!socket || !receiverId) return

    if (!typingRef.current) {
      typingRef.current = true
      socket.emit('typing_start', { receiverId })
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      typingRef.current = false
      socket.emit('typing_stop', { receiverId })
    }, 1500)
  }, [receiverId])

  const stopTyping = useCallback(() => {
    const socket = getSocket()
    if (!socket || !receiverId) return
    clearTimeout(timer.current)
    if (typingRef.current) {
      typingRef.current = false
      socket.emit('typing_stop', { receiverId })
    }
  }, [receiverId])

  return { onType, stopTyping }
}

export function useGroupTyping(groupId) {
  const typingRef = useRef(false)
  const timer     = useRef(null)

  const onType = useCallback(() => {
    const socket = getSocket()
    if (!socket || !groupId) return

    if (!typingRef.current) {
      typingRef.current = true
      socket.emit('group_typing_start', { groupId })
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      typingRef.current = false
      socket.emit('group_typing_stop', { groupId })
    }, 1500)
  }, [groupId])

  const stopTyping = useCallback(() => {
    const socket = getSocket()
    if (!socket || !groupId) return
    clearTimeout(timer.current)
    if (typingRef.current) {
      typingRef.current = false
      socket.emit('group_typing_stop', { groupId })
    }
  }, [groupId])

  return { onType, stopTyping }
}
