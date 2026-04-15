import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import useChatStore from '../../store/chatStore'
import useAuthStore from '../../store/authStore'
import MessageBubble    from './MessageBubble'
import MessageInput     from './MessageInput'
import TypingIndicator  from './TypingIndicator'
import ImageModal       from '../ui/ImageModal'
import { FiArrowLeft, FiMoreVertical } from 'react-icons/fi'
import { format } from 'timeago.js'

export default function ChatWindow() {
  const { user: me }                                                = useAuthStore()
  const { selectedUser, messages, typingUsers, loadingMessages,
          hasMore, selectUser, loadMoreMessages }                   = useChatStore()
  const bottomRef = useRef(null)
  const [previewImg, setPreviewImg] = useState(null)

  // Infinite scroll sentinel
  const { ref: topRef, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    if (inView && hasMore && !loadingMessages) loadMoreMessages()
  }, [inView])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isTyping = typingUsers[selectedUser?._id]

  if (!selectedUser) return null

  return (
    <div className="flex-1 flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}>

      {/* Header */}
      <div className="h-14 flex items-center gap-3 px-4 border-b shrink-0"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <button onClick={() => selectUser(null)}
          className="md:hidden btn-ghost p-1.5 -ml-1">
          <FiArrowLeft size={18} />
        </button>

        <div className="relative shrink-0">
          {selectedUser.profilePic
            ? <img src={selectedUser.profilePic} alt="" className="w-9 h-9 rounded-xl object-cover" />
            : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'var(--accent-1)' }}>
                {selectedUser.name[0].toUpperCase()}
              </div>
          }
          {selectedUser.isOnline
            ? <span className="online-dot  absolute -bottom-0.5 -right-0.5" />
            : <span className="offline-dot absolute -bottom-0.5 -right-0.5" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            {selectedUser.name}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {selectedUser.isOnline ? (
              <span style={{ color: 'var(--accent-2)' }}>● Online</span>
            ) : selectedUser.lastSeen ? (
              `Last seen ${format(selectedUser.lastSeen)}`
            ) : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
        {/* Infinite scroll top sentinel */}
        <div ref={topRef} className="h-1" />

        {loadingMessages && (
          <div className="flex justify-center py-4">
            <span className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--accent-1)' }} />
          </div>
        )}

        {messages.length === 0 && !loadingMessages && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
            <div className="text-4xl">👋</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Say hello to {selectedUser.name}!
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isMine={msg.senderId === me?._id || msg.senderId?._id === me?._id}
            showAvatar={false}
            onImageClick={setPreviewImg}
          />
        ))}

        {isTyping && <TypingIndicator name={selectedUser.name} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput type="dm" />

      {/* Image Preview Modal */}
      {previewImg && <ImageModal src={previewImg} onClose={() => setPreviewImg(null)} />}
    </div>
  )
}
