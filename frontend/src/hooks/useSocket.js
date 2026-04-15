import { useEffect } from 'react'
import { getSocket } from '../utils/socket'
import useChatStore  from '../store/chatStore'
import useGroupStore from '../store/groupStore'

export default function useSocket() {
  const {
    receiveMessage, setOnlineUsers, setUserOffline,
    setTyping, clearTyping, onMessagesSeen,
  } = useChatStore()

  const {
    receiveGroupMessage, onGroupUpdated, onGroupDeleted,
    onAddedToGroup, onRemovedFromGroup,
    setGroupTyping, clearGroupTyping, onGroupMessageDeleted,
  } = useGroupStore()

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    // ── DM events ─────────────────────────────────────────────────
    socket.on('receive_message',   receiveMessage)
    socket.on('online_users',      setOnlineUsers)
    socket.on('user_offline',      setUserOffline)
    socket.on('user_typing',       ({ senderId }) => setTyping(senderId))
    socket.on('user_stop_typing',  ({ senderId }) => clearTyping(senderId))
    socket.on('messages_seen',     onMessagesSeen)

    // ── Group events ──────────────────────────────────────────────
    socket.on('receive_group_message',  receiveGroupMessage)
    socket.on('group_updated',          onGroupUpdated)
    socket.on('group_created',          (g) => useGroupStore.getState().onAddedToGroup(g))
    socket.on('group_deleted',          onGroupDeleted)
    socket.on('added_to_group',         onAddedToGroup)
    socket.on('removed_from_group',     onRemovedFromGroup)
    socket.on('group_user_typing',      ({ senderId, name, groupId }) =>
      setGroupTyping(groupId, senderId, name))
    socket.on('group_user_stop_typing', ({ senderId, groupId }) =>
      clearGroupTyping(groupId, senderId))
    socket.on('group_message_deleted',  ({ messageId, groupId }) =>
      onGroupMessageDeleted(groupId, messageId))

    return () => {
      socket.off('receive_message')
      socket.off('online_users')
      socket.off('user_offline')
      socket.off('user_typing')
      socket.off('user_stop_typing')
      socket.off('messages_seen')
      socket.off('receive_group_message')
      socket.off('group_updated')
      socket.off('group_created')
      socket.off('group_deleted')
      socket.off('added_to_group')
      socket.off('removed_from_group')
      socket.off('group_user_typing')
      socket.off('group_user_stop_typing')
      socket.off('group_message_deleted')
    }
  }, [getSocket()])
}
