import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import useGroupStore from '../../store/groupStore'
import useAuthStore  from '../../store/authStore'
import MessageBubble   from '../chat/MessageBubble'
import MessageInput    from '../chat/MessageInput'
import TypingIndicator from '../chat/TypingIndicator'
import GroupInfoPanel  from './GroupInfoPanel'
import ImageModal      from '../ui/ImageModal'
import { FiArrowLeft, FiUsers, FiInfo } from 'react-icons/fi'

export default function GroupWindow() {
  const { user: me }                                                             = useAuthStore()
  const { selectedGroup, groupMessages, groupTyping, loadingMessages,
          hasMore, selectGroup, loadMoreGroupMessages }                           = useGroupStore()
  const bottomRef   = useRef(null)
  const [previewImg, setPreviewImg] = useState(null)
  const [showInfo,   setShowInfo]   = useState(false)
  const { ref: topRef, inView }     = useInView({ threshold: 0 })

  const messages = groupMessages[selectedGroup?._id] || []
  const typing   = groupTyping[selectedGroup?._id] || {}
  const typingNames = Object.values(typing).filter(Boolean)

  useEffect(() => {
    if (inView && hasMore[selectedGroup?._id] && !loadingMessages)
      loadMoreGroupMessages()
  }, [inView])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (!selectedGroup) return null

  const myMember = selectedGroup.members?.find(m => m.user?._id === me?._id || m.user === me?._id)
  const myRole   = myMember?.role || 'member'

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden"
        style={{ background: 'var(--bg-primary)' }}>

        {/* Header */}
        <div className="h-14 flex items-center gap-3 px-4 border-b shrink-0"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <button onClick={() => selectGroup(null)}
            className="md:hidden btn-ghost p-1.5 -ml-1">
            <FiArrowLeft size={18} />
          </button>

          <div className="shrink-0">
            {selectedGroup.avatar
              ? <img src={selectedGroup.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
              : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  👥
                </div>
            }
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {selectedGroup.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <FiUsers size={10} className="inline mr-1" />
              {selectedGroup.members?.length || 0} members
              {typingNames.length > 0 && (
                <span style={{ color: 'var(--accent-2)' }} className="ml-2">
                  · {typingNames[0]}{typingNames.length > 1 ? ` +${typingNames.length - 1}` : ''} typing...
                </span>
              )}
            </p>
          </div>

          <button onClick={() => setShowInfo(v => !v)}
            className="btn-ghost p-2 rounded-xl"
            style={{ color: showInfo ? 'var(--accent-1)' : 'var(--text-muted)' }}>
            <FiInfo size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          <div ref={topRef} className="h-1" />

          {loadingMessages && (
            <div className="flex justify-center py-4">
              <span className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--accent-1)' }} />
            </div>
          )}

          {messages.length === 0 && !loadingMessages && (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
              <div className="text-4xl">👥</div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No messages yet. Start the conversation!
              </p>
            </div>
          )}

          {messages.map(msg => {
            const senderObj = typeof msg.senderId === 'object' ? msg.senderId : null
            const isMine    = senderObj?._id === me?._id || msg.senderId === me?._id
            return (
              <MessageBubble
                key={msg._id}
                message={msg}
                isMine={isMine}
                showAvatar={!isMine}
                sender={senderObj}
                onImageClick={setPreviewImg}
              />
            )
          })}

          {typingNames.length > 0 && <TypingIndicator name={typingNames[0]} />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <MessageInput type="group" />
      </div>

      {/* Info panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 overflow-hidden border-l"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
          >
            <GroupInfoPanel myRole={myRole} onClose={() => setShowInfo(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {previewImg && <ImageModal src={previewImg} onClose={() => setPreviewImg(null)} />}
    </div>
  )
}
