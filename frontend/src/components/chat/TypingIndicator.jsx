// TypingIndicator.jsx
import { motion } from 'framer-motion'

export default function TypingIndicator({ name }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-end gap-2 justify-start"
    >
      <div className="message-bubble-recv flex items-center gap-1.5 py-3 px-4">
        {[0, 1, 2].map(i => (
          <span key={i} className="typing-dot w-2 h-2 rounded-full animate-typing-dot"
            style={{ background: 'var(--text-muted)', animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </motion.div>
  )
}
