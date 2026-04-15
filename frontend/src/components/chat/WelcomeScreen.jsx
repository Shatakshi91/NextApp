import { motion } from 'framer-motion'
import { FiZap, FiMessageCircle, FiUsers, FiLock } from 'react-icons/fi'

export default function WelcomeScreen() {
  const features = [
    { icon: FiMessageCircle, text: 'Real-time messaging' },
    { icon: FiUsers,         text: 'Group chats & management' },
    { icon: FiLock,          text: 'Secure & private' },
    { icon: FiZap,           text: 'Lightning fast' },
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center"
      style={{ background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
        className="flex flex-col items-center gap-6 max-w-sm"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: 'var(--accent-1)', boxShadow: '0 0 40px var(--accent-glow)' }}
        >
          <FiZap size={36} color="white" />
        </motion.div>

        <div>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Welcome to NexChat
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Select a conversation from the sidebar to start chatting
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          {features.map(({ icon: Icon, text }) => (
            <motion.div
              key={text}
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-2.5 p-3 rounded-xl text-left"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <Icon size={16} style={{ color: 'var(--accent-1)', flexShrink: 0 }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
