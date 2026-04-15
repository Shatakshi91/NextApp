import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore  from '../../store/authStore'
import useThemeStore from '../../store/themeStore'
import { FiZap, FiLogOut, FiUser, FiSun, FiChevronDown } from 'react-icons/fi'
import { RiPaletteLine } from 'react-icons/ri'

const THEME_LABELS = {
  dark:      { label: 'Dark',      emoji: '🌑' },
  neon:      { label: 'Neon',      emoji: '⚡' },
  cyberpunk: { label: 'Cyberpunk', emoji: '🤖' },
  aurora:    { label: 'Aurora',    emoji: '🌿' },
}

export default function Navbar() {
  const { user, logout }         = useAuthStore()
  const { theme, setTheme, themes } = useThemeStore()
  const [showMenu,  setShowMenu]  = useState(false)
  const [showTheme, setShowTheme] = useState(false)

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b z-30 shrink-0"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--accent-1)', boxShadow: '0 0 12px var(--accent-glow)' }}>
          <FiZap size={14} color="white" />
        </div>
        <span className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          NexChat
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme switcher */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setShowTheme(v => !v); setShowMenu(false) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <RiPaletteLine size={14} />
            <span className="hidden sm:inline">{THEME_LABELS[theme]?.label}</span>
            <span>{THEME_LABELS[theme]?.emoji}</span>
          </motion.button>

          <AnimatePresence>
            {showTheme && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTheme(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 rounded-2xl overflow-hidden z-50 w-44"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                >
                  {themes.map(t => (
                    <button key={t} onClick={() => { setTheme(t); setShowTheme(false) }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-all"
                      style={{
                        color:      theme === t ? 'var(--accent-1)' : 'var(--text-secondary)',
                        background: theme === t ? 'var(--bg-hover)' : 'transparent',
                      }}>
                      <span>{THEME_LABELS[t].emoji}</span>
                      <span className="font-medium">{THEME_LABELS[t].label}</span>
                      {theme === t && <span className="ml-auto text-xs opacity-60">✓</span>}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button onClick={() => { setShowMenu(v => !v); setShowTheme(false) }}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-all"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            {user?.profilePic
              ? <img src={user.profilePic} alt="" className="w-7 h-7 rounded-lg object-cover" />
              : <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'var(--accent-1)' }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
            }
            <span className="hidden sm:block text-xs font-medium max-w-[80px] truncate"
              style={{ color: 'var(--text-primary)' }}>
              {user?.name}
            </span>
            <FiChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 rounded-2xl overflow-hidden z-50 w-48"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                  </div>
                  <button onClick={logout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-all text-red-400 hover:bg-red-500/10">
                    <FiLogOut size={14} /> Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
