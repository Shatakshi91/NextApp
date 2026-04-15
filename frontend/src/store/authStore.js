import { create } from 'zustand'
import API from '../utils/axios'
import { initSocket, disconnectSocket } from '../utils/socket'
import toast from 'react-hot-toast'

const useAuthStore = create((set, get) => ({
  user:    JSON.parse(localStorage.getItem('nexchat_user') || 'null'),
  loading: false,

  register: async (data) => {
    set({ loading: true })
    try {
      const res = await API.post('/auth/register', data)
      const { accessToken, refreshToken, user } = res.data
      localStorage.setItem('nexchat_access',  accessToken)
      localStorage.setItem('nexchat_refresh', refreshToken)
      localStorage.setItem('nexchat_user',    JSON.stringify(user))
      set({ user, loading: false })
      initSocket(accessToken)
      toast.success(`Welcome to NexChat, ${user.name}! ⚡`)
      return { success: true }
    } catch (err) {
      set({ loading: false })
      toast.error(err.response?.data?.message || 'Registration failed')
      return { success: false }
    }
  },

  login: async (data) => {
    set({ loading: true })
    try {
      const res = await API.post('/auth/login', data)
      const { accessToken, refreshToken, user } = res.data
      localStorage.setItem('nexchat_access',  accessToken)
      localStorage.setItem('nexchat_refresh', refreshToken)
      localStorage.setItem('nexchat_user',    JSON.stringify(user))
      set({ user, loading: false })
      initSocket(accessToken)
      toast.success(`Welcome back, ${user.name}! ⚡`)
      return { success: true }
    } catch (err) {
      set({ loading: false })
      toast.error(err.response?.data?.message || 'Login failed')
      return { success: false }
    }
  },

  logout: async () => {
    try {
      const refresh = localStorage.getItem('nexchat_refresh')
      await API.post('/auth/logout', { refreshToken: refresh })
    } catch {}
    disconnectSocket()
    localStorage.removeItem('nexchat_access')
    localStorage.removeItem('nexchat_refresh')
    localStorage.removeItem('nexchat_user')
    set({ user: null })
    toast.success('Logged out')
  },

  updateUser: (user) => {
    localStorage.setItem('nexchat_user', JSON.stringify(user))
    set({ user })
  },

  initAuth: () => {
    const token = localStorage.getItem('nexchat_access')
    const user  = JSON.parse(localStorage.getItem('nexchat_user') || 'null')
    if (token && user) {
      initSocket(token)
      set({ user })
    }
  },
}))

export default useAuthStore
