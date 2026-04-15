import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker from 'emoji-picker-react'
import useChatStore  from '../../store/chatStore'
import useGroupStore from '../../store/groupStore'
import { useDMTyping, useGroupTyping } from '../../hooks/useTyping'
import { FiSend, FiImage, FiSmile, FiX } from 'react-icons/fi'

export default function MessageInput({ type = 'dm' }) {
  const [text,      setText]      = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [preview,   setPreview]   = useState(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [sending,   setSending]   = useState(false)
  const inputRef   = useRef(null)
  const fileRef    = useRef(null)

  const { selectedUser, sendMessage: sendDM } = useChatStore()
  const { selectedGroup, sendGroupMessage }   = useGroupStore()

  const { onType: dmType, stopTyping: dmStop }      = useDMTyping(selectedUser?._id)
  const { onType: grpType, stopTyping: grpStop }    = useGroupTyping(selectedGroup?._id)

  const onType = type === 'dm' ? dmType : grpType
  const onStop = type === 'dm' ? dmStop : grpStop

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const clearImage = () => {
    setImageFile(null)
    setPreview(null)
    if (preview) URL.revokeObjectURL(preview)
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if ((!text.trim() && !imageFile) || sending) return

    setSending(true)
    onStop()

    try {
      if (type === 'dm' && selectedUser) {
        await sendDM(selectedUser._id, text.trim(), imageFile)
      } else if (type === 'group' && selectedGroup) {
        await sendGroupMessage(selectedGroup._id, text.trim(), imageFile)
      }
      setText('')
      clearImage()
      setShowEmoji(false)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="px-4 py-3 border-t shrink-0 relative"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmoji && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowEmoji(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-16 left-4 z-30"
            >
              <EmojiPicker
                onEmojiClick={(e) => setText(t => t + e.emoji)}
                theme="dark"
                skinTonesDisabled
                searchDisabled={false}
                height={360}
                width={300}
                previewConfig={{ showPreview: false }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image preview */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-3 relative inline-block"
          >
            <img src={preview} alt="" className="h-24 rounded-xl object-cover"
              style={{ border: '1px solid var(--border)' }} />
            <button onClick={clearImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ background: 'var(--accent-1)' }}>
              <FiX size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Emoji button */}
        <button type="button"
          onClick={() => setShowEmoji(v => !v)}
          className="btn-ghost p-2.5 rounded-xl shrink-0 self-end"
          style={{ color: showEmoji ? 'var(--accent-1)' : 'var(--text-muted)' }}>
          <FiSmile size={18} />
        </button>

        {/* Image upload */}
        <button type="button" onClick={() => fileRef.current?.click()}
          className="btn-ghost p-2.5 rounded-xl shrink-0 self-end"
          style={{ color: 'var(--text-muted)' }}>
          <FiImage size={18} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

        {/* Text input */}
        <textarea
          ref={inputRef}
          rows={1}
          className="input-field flex-1 resize-none py-2.5 max-h-32 overflow-y-auto"
          placeholder="Type a message…"
          value={text}
          onChange={e => { setText(e.target.value); onType() }}
          onKeyDown={handleKeyDown}
          style={{ lineHeight: '1.5' }}
        />

        {/* Send */}
        <motion.button
          type="submit"
          disabled={(!text.trim() && !imageFile) || sending}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 transition-all self-end"
          style={{
            background: (!text.trim() && !imageFile) ? 'var(--bg-elevated)' : 'var(--accent-1)',
            color:      (!text.trim() && !imageFile) ? 'var(--text-muted)'   : 'white',
            boxShadow:  (!text.trim() && !imageFile) ? 'none' : '0 0 12px var(--accent-glow)',
          }}
        >
          {sending
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <FiSend size={16} />
          }
        </motion.button>
      </form>
    </div>
  )
}
