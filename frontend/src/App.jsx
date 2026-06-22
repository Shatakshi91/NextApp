import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore  from './store/authStore'
import useThemeStore from './store/themeStore'
import useSocket     from './hooks/useSocket'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const JoinInvitePage = lazy(() => import('./pages/JoinInvitePage'))

function SocketProvider({ children }) {
  useSocket()
  return children
}

const Guard = ({ children }) => {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" replace />
}

const LoginRedirect = () => {
  const location = useLocation()
  return <Navigate to="/login" replace state={{ from: location.pathname }} />
}

const PageFallback = () => (
  <div className="min-h-screen grid place-items-center" style={{ background: 'var(--bg-primary)' }}>
    <span className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: 'var(--accent-1)' }} />
  </div>
)

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

      <Suspense fallback={<PageFallback />}>
        {user ? (
          <SocketProvider>
            <Routes>
              <Route path="/"      element={<Guard><ChatPage /></Guard>} />
              <Route path="/join/:inviteCode" element={<Guard><JoinInvitePage /></Guard>} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*"      element={<Navigate to="/" replace />} />
            </Routes>
          </SocketProvider>
        ) : (
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/join/:inviteCode" element={<LoginRedirect />} />
            <Route path="*"         element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </Suspense>
    </>
  )
}
