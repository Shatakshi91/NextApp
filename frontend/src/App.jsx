import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore  from './store/authStore'
import useThemeStore from './store/themeStore'
import useSocket     from './hooks/useSocket'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import ChatPage      from './pages/ChatPage'

function SocketProvider({ children }) {
  useSocket()
  return children
}

const Guard = ({ children }) => {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { initAuth } = useAuthStore()
  const { initTheme } = useThemeStore()

  useEffect(() => {
    initTheme()
    initAuth()
  }, [])

  const { user } = useAuthStore()

  return (
    <>
      {/* Background glow orbs */}
      <div className="glow-orb w-96 h-96 top-0 left-1/4"
        style={{ background: 'var(--accent-1)' }} />
      <div className="glow-orb w-72 h-72 bottom-0 right-1/4"
        style={{ background: 'var(--accent-2)' }} />

      {user ? (
        <SocketProvider>
          <Routes>
            <Route path="/"      element={<Guard><ChatPage /></Guard>} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*"      element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      ) : (
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*"         element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </>
  )
}
