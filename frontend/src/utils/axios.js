import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexchat_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue  = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const isAuthRoute = original.url?.includes('/auth/login') || original.url?.includes('/auth/register')

    if (error.response?.status === 401 && !isAuthRoute && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return API(original)
        })
      }

      original._retry = true
      isRefreshing    = true

      const refreshToken = localStorage.getItem('nexchat_refresh')
      if (!refreshToken) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          { refreshToken }
        )
        const { accessToken, refreshToken: newRefresh } = res.data
        localStorage.setItem('nexchat_access',  accessToken)
        localStorage.setItem('nexchat_refresh', newRefresh)
        API.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)
        original.headers.Authorization = `Bearer ${accessToken}`
        return API(original)
      } catch (err) {
        processQueue(err, null)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default API
