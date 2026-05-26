import { create } from 'zustand'
import API from '../utils/axios'
import { getSocket } from '../utils/socket'
import toast from 'react-hot-toast'

const useGroupStore = create((set, get) => ({
  groups:          [],
  selectedGroup:   null,
  groupMessages:   {},   // groupId -> messages[]
  groupTyping:     {},   // groupId -> { userId: name }
  unreadGroupCounts: {}, // groupId -> count
  loadingGroups:   false,
  loadingMessages: false,
  hasMore:         {},   // groupId -> bool
  pages:           {},   // groupId -> page

  // ── Fetch user's groups ──────────────────────────────────────────
  fetchGroups: async () => {
    set({ loadingGroups: true })
    try {
      const res = await API.get('/groups')
      set({ groups: res.data.groups, loadingGroups: false })
    } catch {
      set({ loadingGroups: false })
    }
  },

  // ── Select a group ───────────────────────────────────────────────
  selectGroup: (group) => {
    set({ selectedGroup: group })
    if (group) {
      const existing = get().groupMessages[group._id]
      if (!existing || existing.length === 0) get().fetchGroupMessages(group._id, 1, true)
      get().markGroupRead(group._id)
      // Join socket room
      const socket = getSocket()
      if (socket) socket.emit('join_group', group._id)
    }
  },

  // ── Fetch group messages ─────────────────────────────────────────
  fetchGroupMessages: async (groupId, page = 1, reset = false) => {
    set({ loadingMessages: true })
    try {
      const res = await API.get(`/groups/${groupId}/messages?page=${page}&limit=30`)
      set(s => ({
        groupMessages: {
          ...s.groupMessages,
          [groupId]: reset ? res.data.messages : [...res.data.messages, ...(s.groupMessages[groupId] || [])],
        },
        hasMore: { ...s.hasMore, [groupId]: res.data.hasMore },
        pages:   { ...s.pages,   [groupId]: page },
        loadingMessages: false,
      }))
    } catch {
      set({ loadingMessages: false })
    }
  },

  loadMoreGroupMessages: async () => {
    const { selectedGroup, pages, hasMore, loadingMessages } = get()
    if (!selectedGroup || loadingMessages || !hasMore[selectedGroup._id]) return
    const nextPage = (pages[selectedGroup._id] || 1) + 1
    get().fetchGroupMessages(selectedGroup._id, nextPage, false)
  },

  // ── Send group message ───────────────────────────────────────────
  sendGroupMessage: async (groupId, text, imageFile) => {
    const tempId = `temp_${Date.now()}`
    const myUser = JSON.parse(localStorage.getItem('nexchat_user') || '{}')

    const optimistic = {
      _id:       tempId,
      groupId,
      senderId:  { _id: myUser._id, name: myUser.name, profilePic: myUser.profilePic },
      text:      text || '',
      image:     '',
      type:      'text',
      createdAt: new Date().toISOString(),
      pending:   true,
    }
    set(s => ({
      groupMessages: {
        ...s.groupMessages,
        [groupId]: [...(s.groupMessages[groupId] || []), optimistic],
      },
    }))

    try {
      let res
      if (imageFile) {
        const fd = new FormData()
        if (text) fd.append('text', text)
        fd.append('image', imageFile)
        res = await API.post(`/groups/${groupId}/messages`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        res = await API.post(`/groups/${groupId}/messages`, { text })
      }

      set(s => ({
        groupMessages: {
          ...s.groupMessages,
          [groupId]: (s.groupMessages[groupId] || []).map(m => m._id === tempId ? res.data.message : m),
        },
      }))

      get().updateGroupLastMessage(groupId, res.data.message)

    } catch (err) {
      set(s => ({
        groupMessages: {
          ...s.groupMessages,
          [groupId]: (s.groupMessages[groupId] || []).filter(m => m._id !== tempId),
        },
      }))
      toast.error(err.response?.data?.message || 'Failed to send')
    }
  },

  // ── Receive group message (socket) ───────────────────────────────
  receiveGroupMessage: (message) => {
    const { selectedGroup, unreadGroupCounts } = get()
    const groupId = message.groupId
    const senderId = typeof message.senderId === 'object' ? message.senderId?._id : message.senderId
    const myUser = JSON.parse(localStorage.getItem('nexchat_user') || '{}')

    set(s => {
      const existing = s.groupMessages[groupId] || []
      if (existing.some(m => m._id === message._id)) return s

      const pendingIndex = existing.findIndex(m =>
        m.pending &&
        senderId === myUser._id &&
        m.text === message.text &&
        Boolean(m.image) === Boolean(message.image)
      )

      const nextMessages = pendingIndex >= 0
        ? existing.map((m, i) => i === pendingIndex ? message : m)
        : [...existing, message]

      return {
        groupMessages: {
          ...s.groupMessages,
          [groupId]: nextMessages,
        },
      }
    })

    if (selectedGroup?._id !== groupId) {
      set({
        unreadGroupCounts: {
          ...unreadGroupCounts,
          [groupId]: (unreadGroupCounts[groupId] || 0) + 1,
        },
      })
    }

    get().updateGroupLastMessage(groupId, message)
  },


  updateGroupLastMessage: (groupId, message) => {
    set(s => ({
      groups: s.groups.map(g =>
        g._id === groupId
          ? { ...g, lastMessage: { text: message.text || '📷 Image', sender: message.senderId?.name || '', createdAt: message.createdAt } }
          : g
      ),
    }))
  },

  markGroupRead: async (groupId) => {
    try {
      await API.patch(`/groups/${groupId}/messages/read`)
      set(s => ({ unreadGroupCounts: { ...s.unreadGroupCounts, [groupId]: 0 } }))
    } catch {}
  },

  // ── Group management ─────────────────────────────────────────────
  createGroup: async (data, avatarFile) => {
    try {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(i => fd.append(k, i))
        else fd.append(k, v)
      })
      if (avatarFile) fd.append('avatar', avatarFile)
      const res = await API.post('/groups', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      set(s => ({ groups: [res.data.group, ...s.groups] }))
      toast.success('Group created! 🎉')
      return { success: true, group: res.data.group }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group')
      return { success: false }
    }
  },

  updateGroup: async (groupId, data, avatarFile) => {
    try {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => fd.append(k, v))
      if (avatarFile) fd.append('avatar', avatarFile)
      const res = await API.put(`/groups/${groupId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      set(s => ({
        groups:        s.groups.map(g => g._id === groupId ? res.data.group : g),
        selectedGroup: s.selectedGroup?._id === groupId ? res.data.group : s.selectedGroup,
      }))
      toast.success('Group updated!')
      return { success: true, group: res.data.group }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
      return { success: false }
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await API.delete(`/groups/${groupId}`)
      set(s => ({
        groups:        s.groups.filter(g => g._id !== groupId),
        selectedGroup: s.selectedGroup?._id === groupId ? null : s.selectedGroup,
      }))
      toast.success('Group deleted')
      return { success: true }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
      return { success: false }
    }
  },

  addMembers: async (groupId, userIds) => {
    try {
      const res = await API.post(`/groups/${groupId}/members`, { userIds })
      set(s => ({
        groups:        s.groups.map(g => g._id === groupId ? res.data.group : g),
        selectedGroup: s.selectedGroup?._id === groupId ? res.data.group : s.selectedGroup,
      }))
      toast.success('Members added!')
      return { success: true }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
      return { success: false }
    }
  },

  removeMember: async (groupId, userId) => {
    try {
      const res = await API.delete(`/groups/${groupId}/members/${userId}`)
      set(s => ({
        groups:        s.groups.map(g => g._id === groupId ? (res.data.group || g) : g),
        selectedGroup: s.selectedGroup?._id === groupId ? (res.data.group || null) : s.selectedGroup,
      }))
      toast.success('Member removed')
      return { success: true }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
      return { success: false }
    }
  },

  changeMemberRole: async (groupId, userId, role) => {
    try {
      const res = await API.patch(`/groups/${groupId}/members/${userId}/role`, { role })
      set(s => ({
        groups:        s.groups.map(g => g._id === groupId ? res.data.group : g),
        selectedGroup: s.selectedGroup?._id === groupId ? res.data.group : s.selectedGroup,
      }))
      toast.success('Role updated')
      return { success: true }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
      return { success: false }
    }
  },

  regenerateInvite: async (groupId) => {
    try {
      const res = await API.post(`/groups/${groupId}/invite`)
      toast.success('New invite link generated!')
      return { success: true, inviteCode: res.data.inviteCode }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
      return { success: false }
    }
  },

  joinViaInvite: async (inviteCode) => {
    try {
      const res = await API.post(`/groups/join/${inviteCode}`)
      if (!res.data.alreadyMember) {
        set(s => ({ groups: [res.data.group, ...s.groups] }))
        const socket = getSocket()
        if (socket) socket.emit('join_group', res.data.group._id)
      }
      toast.success('Joined group!')
      return { success: true, group: res.data.group }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid invite')
      return { success: false }
    }
  },

  // ── Socket-driven updates ────────────────────────────────────────
  onGroupUpdated: (group) => {
    set(s => ({
      groups:        s.groups.map(g => g._id === group._id ? group : g),
      selectedGroup: s.selectedGroup?._id === group._id ? group : s.selectedGroup,
    }))
  },

  onGroupDeleted: ({ groupId }) => {
    set(s => ({
      groups:        s.groups.filter(g => g._id !== groupId),
      selectedGroup: s.selectedGroup?._id === groupId ? null : s.selectedGroup,
    }))
  },

  onAddedToGroup: (group) => {
    set(s => ({ groups: [group, ...s.groups.filter(g => g._id !== group._id)] }))
    toast.success(`You were added to "${group.name}"`)
    const socket = getSocket()
    if (socket) socket.emit('join_group', group._id)
  },

  onRemovedFromGroup: ({ groupId }) => {
    set(s => ({
      groups:        s.groups.filter(g => g._id !== groupId),
      selectedGroup: s.selectedGroup?._id === groupId ? null : s.selectedGroup,
    }))
    toast.error('You were removed from a group')
  },

  // ── Group typing ─────────────────────────────────────────────────
  setGroupTyping: (groupId, userId, name) => {
    set(s => ({
      groupTyping: { ...s.groupTyping, [groupId]: { ...(s.groupTyping[groupId] || {}), [userId]: name } },
    }))
  },
  clearGroupTyping: (groupId, userId) => {
    set(s => {
      const gt = { ...(s.groupTyping[groupId] || {}) }
      delete gt[userId]
      return { groupTyping: { ...s.groupTyping, [groupId]: gt } }
    })
  },

  onGroupMessageDeleted: (groupId, messageId) => {
    set(s => ({
      groupMessages: {
        ...s.groupMessages,
        [groupId]: (s.groupMessages[groupId] || []).filter(m => m._id !== messageId),
      },
    }))
  },
}))

export default useGroupStore
