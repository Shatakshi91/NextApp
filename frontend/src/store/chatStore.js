import { create } from 'zustand'
import API from '../utils/axios'
import { getSocket } from '../utils/socket'
import toast from 'react-hot-toast'

const useChatStore = create((set, get) => ({
  users:          [],
  selectedUser:   null,
  messages:       [],
  unreadCounts:   {},
  onlineUsers:    [],
  typingUsers:    {}, // userId -> true
  loadingUsers:   false,
  loadingMessages:false,
  hasMore:        false,
  page:           1,

  // ── Fetch all users ──────────────────────────────────────────────
  fetchUsers: async () => {
    set({ loadingUsers: true })
    try {
      const res = await API.get('/users')
      set({ users: res.data.users, loadingUsers: false })
    } catch {
      set({ loadingUsers: false })
    }
  },

  // ── Select a user to chat with ───────────────────────────────────
  selectUser: (user) => {
    set({ selectedUser: user, messages: [], page: 1, hasMore: false })
    if (user) {
      get().fetchMessages(user._id, 1, true)
      get().markSeen(user._id)
    }
  },

  // ── Fetch messages (paginated) ───────────────────────────────────
  fetchMessages: async (userId, page = 1, reset = false) => {
    set({ loadingMessages: true })
    try {
      const res = await API.get(`/messages/${userId}?page=${page}&limit=30`)
      set(state => ({
        messages:        reset ? res.data.messages : [...res.data.messages, ...state.messages],
        hasMore:         res.data.hasMore,
        page:            page,
        loadingMessages: false,
      }))
    } catch {
      set({ loadingMessages: false })
    }
  },

  loadMoreMessages: async () => {
    const { selectedUser, page, hasMore, loadingMessages } = get()
    if (!hasMore || loadingMessages || !selectedUser) return
    get().fetchMessages(selectedUser._id, page + 1, false)
  },

  // ── Send a message (REST + optimistic) ──────────────────────────
  sendMessage: async (receiverId, text, imageFile) => {
    const tempId = `temp_${Date.now()}`
    const myUser = JSON.parse(localStorage.getItem('nexchat_user') || '{}')

    // Optimistic update
    const optimistic = {
      _id:        tempId,
      senderId:   myUser._id,
      receiverId,
      text:       text || '',
      image:      '',
      seen:       false,
      delivered:  false,
      createdAt:  new Date().toISOString(),
      pending:    true,
    }
    set(s => ({ messages: [...s.messages, optimistic] }))

    try {
      let res
      if (imageFile) {
        const fd = new FormData()
        if (text) fd.append('text', text)
        fd.append('image', imageFile)
        res = await API.post(`/messages/${receiverId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        res = await API.post(`/messages/${receiverId}`, { text })
      }

      // Replace optimistic with real message
      set(s => ({
        messages: s.messages.map(m => m._id === tempId ? res.data.message : m),
      }))

      // Also emit via socket for real-time
      const socket = getSocket()
      if (socket) socket.emit('send_message', res.data.message)

    } catch (err) {
      // Remove optimistic, show error
      set(s => ({ messages: s.messages.filter(m => m._id !== tempId) }))
      toast.error(err.response?.data?.message || 'Failed to send')
    }
  },

  // ── Receive a message (from socket) ─────────────────────────────
  receiveMessage: (message) => {
    const { selectedUser, unreadCounts } = get()

    if (selectedUser && (
      message.senderId === selectedUser._id ||
      message.receiverId === selectedUser._id
    )) {
      set(s => ({ messages: [...s.messages, message] }))
      get().markSeen(message.senderId)
    } else {
      // Increment unread
      set({
        unreadCounts: {
          ...unreadCounts,
          [message.senderId]: (unreadCounts[message.senderId] || 0) + 1,
        },
      })
      // Update last message in users list
      get().updateUserLastMessage(message.senderId, message)
    }
  },

  updateUserLastMessage: (userId, message) => {
    set(s => ({
      users: s.users.map(u => u._id === userId ? { ...u, lastMessage: message } : u),
    }))
  },

  // ── Mark messages as seen ────────────────────────────────────────
  markSeen: async (senderId) => {
    try {
      await API.patch(`/messages/seen/${senderId}`)
      const socket = getSocket()
      if (socket) socket.emit('mark_seen', { senderId })
      set(s => ({
        unreadCounts: { ...s.unreadCounts, [senderId]: 0 },
        messages:     s.messages.map(m =>
          m.senderId === senderId ? { ...m, seen: true } : m
        ),
      }))
    } catch {}
  },

  // ── Fetch unread counts ──────────────────────────────────────────
  fetchUnreadCounts: async () => {
    try {
      const res = await API.get('/messages/unread')
      set({ unreadCounts: res.data.unreadCounts })
    } catch {}
  },

  // ── Online users ─────────────────────────────────────────────────
  setOnlineUsers: (userIds) => {
    set({ onlineUsers: userIds })
    set(s => ({
      users: s.users.map(u => ({ ...u, isOnline: userIds.includes(u._id) })),
    }))
  },

  setUserOffline: ({ userId, lastSeen }) => {
    set(s => ({
      onlineUsers: s.onlineUsers.filter(id => id !== userId),
      users:       s.users.map(u => u._id === userId ? { ...u, isOnline: false, lastSeen } : u),
      selectedUser: s.selectedUser?._id === userId
        ? { ...s.selectedUser, isOnline: false, lastSeen }
        : s.selectedUser,
    }))
  },

  // ── Typing ───────────────────────────────────────────────────────
  setTyping:     (userId) => set(s => ({ typingUsers: { ...s.typingUsers, [userId]: true  } })),
  clearTyping:   (userId) => set(s => ({ typingUsers: { ...s.typingUsers, [userId]: false } })),

  // ── Messages seen callback ───────────────────────────────────────
  onMessagesSeen: ({ by }) => {
    set(s => ({
      messages: s.messages.map(m => m.receiverId === by ? { ...m, seen: true } : m),
    }))
  },
}))

export default useChatStore
